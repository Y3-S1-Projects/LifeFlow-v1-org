import Appointment from "../models/Appointment.js";
import Camp from "../models/Camp.js";
import User from "../models/User.js"; // Assuming you have a User model
import emailService from "../services/emailService.js"; // Import the email service

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_FRONTEND
    : process.env.LOCAL_FRONTEND;

/**
 * @desc Create a new appointment
 * @route POST /api/appointments
 */
export const createAppointment = async (req, res) => {
  try {
    const { userId, campId, date, time } = req.body;

    // Check if camp exists
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    // Check if user exists and get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has reached the maximum number of appointments (3)
    const appointmentCount = await Appointment.countDocuments({
      userId,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (appointmentCount >= 3) {
      return res.status(400).json({
        message: "You cannot have more than 3 active appointments",
        errorType: "APPOINTMENT_LIMIT_REACHED",
      });
    }

    // Check if user has already booked for the same camp
    const existingAppointment = await Appointment.findOne({
      userId,
      campId,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "You have already booked this camp",
        errorType: "ALREADY_BOOKED",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      campId,
      date,
      time,
    });

    // Send confirmation email
    await emailService.sendTemplateEmail({
      to: user.email,
      subject: "Appointment Booking Confirmation",
      templateParams: {
        title: "Appointment Booked",
        mainMessage: "Your appointment has been successfully booked!",
        details: [
          { label: "Camp", value: camp.name },
          { label: "Date", value: date },
          { label: "Time", value: time },
        ],
        actionButton: {
          text: "View Appointment",
          link: `${FRONTEND_URL}/donor/appointments`,
        },
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get all appointments for a user
 * @route GET /api/appointments/user/:userId
 */
export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ userId }).populate("campId");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Cancel an appointment
 * @route DELETE /api/appointments/:id
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("userId")
      .populate("campId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Send cancellation email
    await emailService.sendTemplateEmail({
      to: appointment.userId.email,
      subject: "Appointment Canceled",
      templateParams: {
        title: "Appointment Cancellation",
        mainMessage: "Your appointment has been canceled.",
        details: [
          { label: "Camp", value: appointment.campId.name },
          { label: "Original Date", value: appointment.date },
          { label: "Original Time", value: appointment.time },
        ],
        additionalInfo: "If this was a mistake, please contact support.",
      },
    });

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({ message: "Appointment canceled" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Confirm an appointment (Admin feature)
 * @route PATCH /api/appointments/confirm/:id
 */
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("userId")
      .populate("campId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "Confirmed";
    await appointment.save();

    // Send confirmation email
    await emailService.sendTemplateEmail({
      to: appointment.userId.email,
      subject: "Appointment Confirmed",
      templateParams: {
        title: "Appointment Confirmation",
        mainMessage: "Your appointment has been officially confirmed!",
        details: [
          { label: "Camp", value: appointment.campId.name },
          { label: "Date", value: appointment.date },
          { label: "Time", value: appointment.time },
        ],
        actionButton: {
          text: "View Appointment Details",
          link: `${process.env.FRONTEND_URL}/appointments/${id}`,
        },
      },
    });

    res.status(200).json({ message: "Appointment confirmed", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Update an appointment
 * @route PATCH /api/appointments/:id
 */
export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find the existing appointment to get previous details
    const existingAppointment = await Appointment.findById(id)
      .populate("userId")
      .populate("campId");

    if (!existingAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("campId");

    // Send update notification email
    await emailService.sendTemplateEmail({
      to: existingAppointment.userId.email,
      subject: "Appointment Updated",
      templateParams: {
        title: "Appointment Update",
        mainMessage: "Your appointment details have been modified.",
        details: [
          { label: "Camp", value: existingAppointment.campId.name },
          { label: "Previous Date", value: existingAppointment.date },
          { label: "Previous Time", value: existingAppointment.time },
          { label: "New Date", value: updatedAppointment.date },
          { label: "New Time", value: updatedAppointment.time },
        ],
        actionButton: {
          text: "View Updated Appointment",
          link: `${process.env.FRONTEND_URL}/appointments/${id}`,
        },
        additionalInfo:
          "If these changes are incorrect, please contact support.",
      },
    });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({
      message: "Error updating appointment",
      error: error.message,
    });
  }
};
