import Camp from "../models/Camp.js";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Organizer from "../models/Organizer.js";

export const createCamp = async (req, res) => {
  try {
    const {
      name,
      description,
      operatingHours,
      lat,
      lng,
      address,
      status,
      availableDates,
      contact,
      organizer,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !operatingHours ||
      !lat ||
      !lng ||
      !address ||
      !contact ||
      !availableDates ||
      !organizer
    ) {
      console.log("Validation Error: Missing required fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    const { street, city, postalCode } = address;
    if (!street || !city || !postalCode) {
      console.log("Validation Error: Incomplete address fields");
      return res.status(400).json({ error: "Address fields are incomplete" });
    }

    // Create location in GeoJSON format
    const location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
    };

    // Create new camp
    const newCamp = new Camp({
      name,
      description,
      operatingHours,
      location, // Use the GeoJSON location object
      address,
      status: status || "Upcoming",
      availableDates,
      contact,
      organizer,
    });

    // Save the new camp to the database
    const savedCamp = await newCamp.save();

    // Update organizer's createdCamps array with the new camp ID
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizer,
      { $push: { createdCamps: savedCamp._id } },
      { new: true }
    );

    if (!updatedOrganizer) {
      // If organizer not found, delete the camp that was just created
      await Camp.findByIdAndDelete(savedCamp._id);
      return res.status(404).json({ error: "Organizer not found" });
    }

    // Return the created camp in the response
    res.status(201).json({
      message: "Camp created successfully and added to organizer's profile",
      camp: savedCamp,
      organizer: {
        id: updatedOrganizer._id,
        name: updatedOrganizer.orgName,
        campCount: updatedOrganizer.createdCamps.length,
      },
    });
  } catch (error) {
    console.log("Error:", error.message);
    res
      .status(500)
      .json({ error: "Failed to create camp", details: error.message });
  }
};

export const getNearbyCamps = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: "Missing location parameters" });
    }

    const nearbyCamps = await Camp.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance", // Distance in meters
          maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          spherical: true,
        },
      },
      {
        $addFields: {
          distance: {
            $cond: {
              if: { $lt: ["$distance", 1000] }, // If distance is less than 1000 meters
              then: { $round: ["$distance", 0] }, // Show in meters (rounded to nearest integer)
              else: { $round: [{ $divide: ["$distance", 1000] }, 2] }, // Show in kilometers (rounded to 2 decimal places)
            },
          },
          distanceUnit: {
            $cond: {
              if: { $lt: ["$distance", 1000] }, // If distance is less than 1000 meters
              then: "m", // Unit is meters
              else: "km", // Unit is kilometers
            },
          },
        },
      },
    ]);

    res.status(200).json(nearbyCamps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby camps" });
  }
};

export const getCamps = async (req, res) => {
  try {
    const camps = await Camp.find();
    res.status(200).json(camps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching camps", error });
  }
};

// Controller method (add to your existing controller file)
export const getCampById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid camp ID format" });
    }

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    res.status(200).json(camp);
  } catch (error) {
    console.error("Error fetching camp by ID:", error);
    res.status(500).json({
      message: "Error fetching camp",
      error: error.message,
    });
  }
};

export const updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ message: "Camp ID is required" });
    }

    const updatedCamp = await Camp.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedCamp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    res.status(200).json(updatedCamp);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating camp", error: error.message });
  }
};

export const getCampsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params; // Extract organizerId from URL parameters

    // Validate organizerId
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    // Find all camps organized by the specific organizer
    const camps = await Camp.find({ organizer: organizerId });

    // If no camps are found, return a 404
    if (camps.length === 0) {
      return res
        .status(404)
        .json({ message: "No camps found for this organizer" });
    }

    // Return the list of camps
    res.status(200).json({ camps });
  } catch (error) {
    console.error("Error fetching camps by organizer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUpcomingCampsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params; // Extract organizerId from URL parameters

    // Validate organizerId
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    // Get the current date
    const currentDate = new Date();

    // Find all camps organized by the specific organizer where at least one date in availableDates is greater than the current date
    const camps = await Camp.find({
      organizer: organizerId,
      availableDates: { $elemMatch: { $gt: currentDate } }, // Check if any date in the array is in the future
    });

    // If no upcoming camps are found, return a 404
    if (camps.length === 0) {
      return res
        .status(404)
        .json({ message: "No upcoming camps found for this organizer" });
    }

    // Return the list of upcoming camps
    res.status(200).json({ camps });
  } catch (error) {
    console.error("Error fetching upcoming camps by organizer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersRegisteredInCamp = async (req, res) => {
  try {
    const { campId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campId)) {
      return res.status(400).json({ message: "Invalid camp ID" });
    }

    const appointments = await Appointment.find({ campId }).populate("userId");

    // Filter out any appointments with null userId before mapping
    const users = appointments
      .filter((appointment) => appointment.userId != null)
      .map((appointment) => appointment.userId);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this camp" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users for camp:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;

    const camp = await Camp.findById(id);
    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    await Camp.findByIdAndDelete(id);
    res.status(200).json({ message: "Camp deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete camp" });
  }
};


