// backend/controllers/chatbotController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Camp from "../models/Camp.js";
import moment from "moment";

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
            "name address.street address.city operatingHours contact availableDates"
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

    // Enhanced context with user data and nearby camps
    const systemPrompt = `You are a helpful assistant for a blood donation camp finder website called lifeflow.You are answering to a user that is interested in donating blood and seeking information. Only answer questions related to blood donation such as:
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
   Contact: ${camp.contact.phone}, ${camp.contact.email}`
  )
  .join("\n")}
`
    : ""
}

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
      userDetails: userDetails
        ? {
            name: `${userDetails.firstName} ${userDetails.lastName}`,
            bloodType: userDetails.bloodType,
            location: userDetails.location,
            eligibilityStatus: eligibilityInfo,
            totalPintsDonated: userDetails.totalPintsDonated || 0,
            lastPintsDonated: userDetails.lastPintsDonated || 0,
          }
        : null,
      nearbyCamps: nearbyCamps.map((camp) => ({
        id: camp._id,
        name: camp.name,
        address: `${camp.address.street}, ${camp.address.city}`,
        availableDates: camp.availableDates,
        operatingHours: camp.operatingHours,
        contact: camp.contact,
      })),
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
};
