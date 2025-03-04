import Appointment from "../models/Appointment.js";
import Camp from "../models/Camp.js";

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

    // Check if user has already booked for the same camp
    const existingAppointment = await Appointment.findOne({ userId, campId });
    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "You have already booked this camp" });
    }

    const appointment = await Appointment.create({
      userId,
      campId,
      date,
      time,
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
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

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
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "Confirmed";
    await appointment.save();
    res.status(200).json({ message: "Appointment confirmed", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateAppointment = async (req, res) => {
  const { id } = req.params; // Extract the appointment ID from the request parameters
  const updateData = req.body; // Extract the updated data from the request body

  try {
    // Find the appointment by ID and update it with the new data
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    // If the appointment is not found, return a 404 error
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Return the updated appointment
    res.status(200).json(updatedAppointment);
  } catch (error) {
    // Handle any errors that occur during the update process
    res
      .status(500)
      .json({ message: "Error updating appointment", error: error.message });
  }
};
