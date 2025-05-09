import mongoose from "mongoose";
import User from "../models/User.js";
import Camp from "../models/Camp.js";
import Appointment from "../models/Appointment.js";
import moment from "moment";
import axios from "axios";

export const processGeminiQuery = async (req, res) => {
  try {
    const { message, history, userId } = req.body;

    // Get user details if userId is provided
    let userDetails = null;
    let nearbyCamps = [];

    if (userId) {
      userDetails = await User.findById(userId)
        .select(
          "firstName lastName bloodType donationHistory nextEligibleDonationDate location isEligible isEligibleToDonate totalPintsDonated lastPintsDonated"
        )
        .lean();

      // If user has location data, find nearby camps
      if (userDetails?.location?.coordinates) {
        nearbyCamps = await Camp.find({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: userDetails.location.coordinates,
              },
              $maxDistance: 10000, // 10km radius
            },
          },
          status: { $in: ["Open", "Upcoming"] },
          availableDates: { $gte: new Date() },
        })
          .select(
            "_id name address.street address.city operatingHours contact availableDates"
          )
          .limit(5)
          .lean();
      }
    }

    // Determine eligibility status based on model data
    const eligibilityInfo = userDetails
      ? {
          isEligible: userDetails.isEligible,
          isEligibleToDonate: userDetails.isEligibleToDonate,
          nextEligibleDate: userDetails.nextEligibleDonationDate,
          daysUntilEligible: userDetails.nextEligibleDonationDate
            ? Math.max(
                0,
                moment(userDetails.nextEligibleDonationDate).diff(
                  moment(),
                  "days"
                )
              )
            : 0,
        }
      : null;

    // Check if message is an appointment booking intent
    const appointmentIntent = detectAppointmentIntent(message);

    const processConversationalBooking = (message, history, nearbyCamps) => {
      // Extract current message intent
      const currentIntent = detectAppointmentIntent(message);

      // Check if we're in a booking conversation by examining history
      const inBookingFlow = history.some(
        (msg) =>
          msg.role === "user" && detectAppointmentIntent(msg.parts[0].text)
      );

      // Initialize collected data
      let collectedData = {
        campId: null,
        date: null,
        time: null,
      };

      // First check current message for details
      const currentMessageDetails = extractAppointmentDetails(
        message,
        nearbyCamps
      );

      // Update collected data with current message details
      if (currentMessageDetails.campId)
        collectedData.campId = currentMessageDetails.campId;
      if (currentMessageDetails.date)
        collectedData.date = currentMessageDetails.date;
      if (currentMessageDetails.time)
        collectedData.time = currentMessageDetails.time;

      // If we're in a booking flow, scan previous messages for missing details
      if (inBookingFlow || currentIntent) {
        // Look through history for missing pieces
        for (const msg of history) {
          if (msg.role === "user") {
            const userMsg = msg.parts[0].text;
            const previousDetails = extractAppointmentDetails(
              userMsg,
              nearbyCamps
            );

            // Fill in missing details from history
            if (!collectedData.campId && previousDetails.campId)
              collectedData.campId = previousDetails.campId;
            if (!collectedData.date && previousDetails.date)
              collectedData.date = previousDetails.date;
            if (!collectedData.time && previousDetails.time)
              collectedData.time = previousDetails.time;
          }
        }
      }

      return {
        isAppointment: currentIntent || inBookingFlow,
        ...collectedData,
      };
    };

    async function fetchCsrfToken() {
      try {
        const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3001";

        const response = await axios.get(`${apiBaseUrl}/api/csrf-token`, {
          withCredentials: true,
        });

        if (response.data && response.data.csrfToken) {
          return response.data.csrfToken;
        } else {
          throw new Error("CSRF token not found in response");
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
        throw error;
      }
    }

    // If it's an appointment intent and we have the required details, process it
    if (appointmentIntent && userId) {
      const { isAppointment, campId, date, time } =
        processConversationalBooking(message, history, nearbyCamps);

      async function createAppointmentDirectly(appointmentData) {
        try {
          // Create appointment directly in the database
          const newAppointment = new Appointment({
            user: appointmentData.userId,
            camp: appointmentData.campId,
            appointmentDate: appointmentData.date,
            appointmentTime: appointmentData.time,
            status: "Confirmed",
            createdAt: new Date(),
          });

          // Save to database
          const savedAppointment = await newAppointment.save();

          return savedAppointment;
        } catch (dbError) {
          console.error(
            "Database error when creating appointment directly:",
            dbError
          );
          throw dbError;
        }
      }

      if (isAppointment && campId && date && time) {
        let appointmentCreated = false;
        let appointmentDetails = null;
        let errorMessage = null;

        // Format the data consistently
        const appointmentData = {
          userId: userId,
          campId: campId,
          date: moment(date).format("YYYY-MM-DD"),
          time: time,
        };

        try {
          const csrfToken = await fetchCsrfToken();

          const apiBaseUrl =
            process.env.API_BASE_URL || "http://localhost:3001";

          const appointmentResponse = await axios.post(
            `${apiBaseUrl}/appointments/create`,
            appointmentData,
            {
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              withCredentials: true,
              timeout: 8000,
            }
          );

          if (appointmentResponse.data && appointmentResponse.data._id) {
            appointmentCreated = true;
            appointmentDetails = appointmentResponse.data;
          } else {
            errorMessage =
              "API returned success but without valid appointment data";
            console.error(errorMessage, appointmentResponse.data);
          }
        } catch (apiError) {
          errorMessage =
            apiError.response?.data?.message || apiError.message || "API error";
          console.error("API appointment creation failed:", errorMessage);

          // ATTEMPT 2: Try direct database insertion as fallback
          if (process.env.ENABLE_DIRECT_DB_FALLBACK === "true") {
            try {
              const directResult = await createAppointmentDirectly(
                appointmentData
              );

              if (directResult && directResult._id) {
                appointmentCreated = true;
                appointmentDetails = directResult;
                errorMessage = null;
              }
            } catch (dbError) {
              console.error(
                "Both API and direct DB insertion failed:",
                dbError
              );
              errorMessage =
                "Failed to create appointment through all available methods";
            }
          }
        }

        // Find the camp name for the response
        const camp = nearbyCamps.find((c) => c._id.toString() === campId);

        if (appointmentCreated) {
          return res.status(200).json({
            response: `Great! I've booked your appointment at ${
              camp?.name || "the selected camp"
            } on ${moment(date).format(
              "MMMM DD, YYYY"
            )} at ${time}. Please arrive 15 minutes before your appointment time and make sure you're well-hydrated.`,
            userDetails: formatUserDetails(userDetails, eligibilityInfo),
            nearbyCamps: getNearbyCampsFormatted(nearbyCamps),
            appointmentCreated: true,
            appointmentDetails: appointmentDetails,
          });
        } else {
          return res.status(200).json({
            response: `I'm sorry, I couldn't book your appointment. ${
              errorMessage || "Please try again or book through the website."
            }`,
            userDetails: formatUserDetails(userDetails, eligibilityInfo),
            nearbyCamps: getNearbyCampsFormatted(nearbyCamps),
            appointmentCreated: false,
            error: errorMessage,
          });
        }
      }
    }

    // Enhanced context with user data and nearby camps
    const systemPrompt = `You are a helpful assistant for a blood donation camp finder website called lifeflow. You are answering to a user that is interested in donating blood and seeking information. Only answer questions related to blood donation such as:
- Eligibility criteria for donating blood
- The blood donation process
- Benefits of donating blood
- Preparation before donation
- Aftercare following donation
- Information about blood types
- Frequency of blood donation
- Location and timing of blood donation camps
- Appointment scheduling

${
  userDetails
    ? `
User Information:
- Name: ${userDetails.firstName} ${userDetails.lastName}
- Blood Type: ${userDetails.bloodType || "Not specified"}
- Location: ${
        userDetails.location?.coordinates
          ? `Coordinates: ${userDetails.location.coordinates[1]}, ${userDetails.location.coordinates[0]} 
          (please translate these coordinates to the nearest city or area in Sri Lanka)`
          : "Not specified"
      }

- Total Pints Donated: ${userDetails.totalPintsDonated || 0}
- Last Pints Donated: ${userDetails.lastPintsDonated || 0}
- Donation Eligibility: ${
        userDetails.isEligibleToDonate
          ? "Currently eligible to donate"
          : userDetails.nextEligibleDonationDate
          ? `Not eligible yet (${
              eligibilityInfo.daysUntilEligible
            } days remaining until ${moment(
              userDetails.nextEligibleDate
            ).format("MMM DD, YYYY")})`
          : "Status unknown"
      }
`
    : ""
}

${
  nearbyCamps.length > 0
    ? `
Nearby Blood Donation Camps:
${nearbyCamps
  .map(
    (camp, index) => `${index + 1}. ${camp.name} - ${camp.address.street}, ${
      camp.address.city
    }
   Available Dates: ${camp.availableDates
     .map((date) => moment(date).format("MMM DD, YYYY"))
     .join(", ")}
   Hours: ${camp.operatingHours}
   Contact: ${camp.contact.phone}, ${camp.contact.email}
   Camp ID: ${camp._id} (include this if user wants to book an appointment)`
  )
  .join("\n")}
`
    : ""
}

For appointment booking, guide the user through these steps:
1. Ask which camp they'd like to book at (list the options)
2. Ask for their preferred date
3. Ask for their preferred time
4. Confirm all details before booking

If at any point the user provides multiple pieces of information (like camp and date together), 
acknowledge that and only ask for the remaining details.

For any questions not related to blood donation, politely explain that you can only provide information about blood donation. Keep responses concise and helpful.

If the user asks about nearby camps or personal eligibility, use the provided user and camp information to give a personalized response.`;

    // Format messages for Gemini API
    const messages = [
      {
        role: "model",
        parts: [{ text: systemPrompt }],
      },
      ...(history || []),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY || "",
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      response: generatedText,
      userDetails: formatUserDetails(userDetails, eligibilityInfo),
      nearbyCamps: getNearbyCampsFormatted(nearbyCamps),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      error: "Failed to process request",
      errorDetails: error.message,
    });
  }
};

// Helper function to format user details consistently
function formatUserDetails(userDetails, eligibilityInfo) {
  if (!userDetails) return null;

  return {
    name: `${userDetails.firstName} ${userDetails.lastName}`,
    bloodType: userDetails.bloodType,
    location: userDetails.location,
    eligibilityStatus: eligibilityInfo,
    totalPintsDonated: userDetails.totalPintsDonated || 0,
    lastPintsDonated: userDetails.lastPintsDonated || 0,
  };
}

// Helper function to detect if a message is intended to book an appointment
function detectAppointmentIntent(message) {
  const bookingKeywords = [
    "book",
    "schedule",
    "make an appointment",
    "reserve",
    "appointment",
    "sign up",
    "register",
    "slot",
  ];

  const lowerMessage = message.toLowerCase();
  return bookingKeywords.some((keyword) => lowerMessage.includes(keyword));
}

// Helper function to extract appointment details from the message
function extractAppointmentDetails(message, nearbyCamps) {
  const lowerMessage = message.toLowerCase();

  // Default response structure
  const result = {
    isAppointment: false,
    campId: null,
    date: null,
    time: null,
  };

  // If no camps available, can't book
  if (!nearbyCamps || nearbyCamps.length === 0) {
    return result;
  }

  // 1. Try to find camp by name or ID
  let selectedCamp = null;
  for (const camp of nearbyCamps) {
    if (lowerMessage.includes(camp.name.toLowerCase())) {
      selectedCamp = camp;
      break;
    }

    // Check if the message explicitly mentions a camp ID
    if (lowerMessage.includes(camp._id.toString())) {
      selectedCamp = camp;
      break;
    }

    // Check if message mentions "camp 1", "camp 2", etc.
    const campIndex = nearbyCamps.indexOf(camp) + 1;
    if (
      lowerMessage.includes(`camp ${campIndex}`) ||
      lowerMessage.includes(`camp#${campIndex}`) ||
      lowerMessage.includes(`camp number ${campIndex}`)
    ) {
      selectedCamp = camp;
      break;
    }
  }

  // If no camp was found, see if they just want the first camp in the list
  if (!selectedCamp && detectAppointmentIntent(message)) {
    selectedCamp = nearbyCamps[0]; // Default to first camp
  }

  if (!selectedCamp) {
    return result;
  }

  // 2. Extract date
  const dateRegexPatterns = [
    /on\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /on\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i,
    /(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i,
    /on\s+(\d{1,2}(?:st|nd|rd|th)?\s+of\s+\w+(?:,?\s+\d{4})?)/i,
    /(\d{1,2}(?:st|nd|rd|th)?\s+of\s+\w+(?:,?\s+\d{4})?)/i,
    /tomorrow/i,
    /next\s+(\w+)/i,
    /this\s+(\w+)/i,
  ];

  let dateText = null;
  for (const pattern of dateRegexPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      dateText = match[1] || match[0]; // Either the captured group or the full match
      break;
    }
  }

  let parsedDate = null;
  if (dateText) {
    if (dateText.toLowerCase() === "tomorrow") {
      parsedDate = moment().add(1, "days").format("YYYY-MM-DD");
    } else if (dateText.toLowerCase().includes("next")) {
      const dayOfWeek = dateText.toLowerCase().replace("next", "").trim();
      const dayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      if (dayMap[dayOfWeek] !== undefined) {
        const today = moment().day();
        const daysToAdd = (7 - today + dayMap[dayOfWeek]) % 7 || 7;
        parsedDate = moment().add(daysToAdd, "days").format("YYYY-MM-DD");
      }
    } else {
      parsedDate = moment(dateText, [
        "MM/DD/YYYY",
        "MM-DD-YYYY",
        "DD/MM/YYYY",
        "DD-MM-YYYY",
        "MMMM DD, YYYY",
        "MMMM DD YYYY",
        "DD MMMM, YYYY",
        "DD of MMMM, YYYY",
        "DD of MMMM YYYY",
      ]).format("YYYY-MM-DD");
    }
  }

  // 3. Extract time
  const timeRegexPatterns = [
    /at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
    /at\s+(\d{1,2}(?::\d{2})?)/i,
    /(\d{1,2}(?::\d{2})?)/i,
  ];

  let timeText = null;
  for (const pattern of timeRegexPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      timeText = match[1];
      break;
    }
  }

  // Format time properly
  let formattedTime = null;
  if (timeText) {
    // Check if am/pm is specified
    const hasAmPm = /am|pm/i.test(timeText);
    if (!hasAmPm) {
      // Assume AM for times before 12, PM for times 12 and after
      const hourMatch = timeText.match(/^(\d{1,2})/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1]);
        timeText = `${timeText} ${hour < 12 ? "AM" : "PM"}`;
      }
    }

    // Standardize format
    const timeMoment = moment(timeText, [
      "h:mm A",
      "h A",
      "hh:mm A",
      "h:mm a",
      "h a",
      "hh:mm a",
    ]);

    if (timeMoment.isValid()) {
      // Use a standard time format the API expects
      formattedTime = timeMoment.format("h:mm A");
    } else {
      console.error("Invalid time parsed:", timeText);
      formattedTime = "10:00 AM"; // Default time if parsing fails
    }
  }

  if (parsedDate) {
    // Ensure the date is in YYYY-MM-DD format
    const momentDate = moment(parsedDate);
    if (momentDate.isValid()) {
      parsedDate = momentDate.format("YYYY-MM-DD");
    } else {
      console.error("Invalid date parsed:", parsedDate);
      parsedDate = null;
    }
  }

  // Validate date against available dates
  if (parsedDate && selectedCamp) {
    const availableDates = selectedCamp.availableDates.map((d) =>
      moment(d).format("YYYY-MM-DD")
    );
    if (!availableDates.includes(parsedDate)) {
      if (availableDates.length > 0) {
        const closestDate = availableDates.reduce((prev, curr) => {
          const prevDiff = Math.abs(moment(prev).diff(parsedDate, "days"));
          const currDiff = Math.abs(moment(curr).diff(parsedDate, "days"));
          return prevDiff < currDiff ? prev : curr;
        });
        parsedDate = closestDate;
      } else {
        parsedDate = null;
      }
    }
  }

  if (selectedCamp && parsedDate) {
    result.isAppointment = true;
    result.campId = selectedCamp._id.toString();
    result.date = parsedDate;
    result.time = formattedTime || "10:00 AM";
  }

  return result;
}

// Format nearby camps for response
function getNearbyCampsFormatted(camps) {
  return camps.map((camp) => ({
    id: camp._id,
    name: camp.name,
    address: `${camp.address.street}, ${camp.address.city}`,
    availableDates: camp.availableDates,
    operatingHours: camp.operatingHours,
    contact: camp.contact,
  }));
}
