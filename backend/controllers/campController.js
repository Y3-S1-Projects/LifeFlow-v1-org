import Camp from "../models/Camp.js";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Organizer from "../models/Organizer.js";

// Original function modified to set camps to Pending by default
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

    // Create new camp with pending approval status
    const newCamp = new Camp({
      name,
      description,
      operatingHours,
      location,
      address,
      status: status || "Upcoming",
      approvalStatus: "Pending", // Set the default approval status to pending
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
      message: "Camp created successfully and pending admin approval",
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

// Modified to show only approved camps
export const getNearbyCamps = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: "Missing location parameters" });
    }

    const nearbyCamps = await Camp.aggregate([
      {
        $match: {
          approvalStatus: "Approved" // Only show approved camps
        }
      },
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

// Modified to show only approved camps by default
export const getCamps = async (req, res) => {
  try {
    const camps = await Camp.find({ approvalStatus: "Approved" });
    res.status(200).json(camps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching camps", error });
  }
};

// Get all camps that need approval (for admin dashboard)
export const getPendingApprovalCamps = async (req, res) => {
  try {
    const pendingCamps = await Camp.find({ approvalStatus: "Pending" })
      .populate("organizer", "orgName email contact")
      .sort({ createdAt: -1 });

    res.status(200).json({ camps: pendingCamps });
  } catch (error) {
    console.error("Error fetching pending camps:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve a camp (for admin)
export const approveCamp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid camp ID" });
    }

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.approvalStatus !== "Pending") {
      return res.status(400).json({ 
        message: `Camp already ${camp.approvalStatus.toLowerCase()}. No action needed.` 
      });
    }

    const updatedCamp = await Camp.findByIdAndUpdate(
      id,
      {
        approvalStatus: "Approved",
        "approvalDetails.approvedAt": new Date()
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Camp approved successfully", 
      camp: updatedCamp 
    });
  } catch (error) {
    console.error("Error approving camp:", error);
    res.status(500).json({ message: "Failed to approve camp", error: error.message });
  }
};

// Reject a camp (for admin)
export const rejectCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid camp ID" });
    }

    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.approvalStatus !== "Pending") {
      return res.status(400).json({ 
        message: `Camp already ${camp.approvalStatus.toLowerCase()}. No action needed.` 
      });
    }

    const updatedCamp = await Camp.findByIdAndUpdate(
      id,
      {
        approvalStatus: "Rejected",
        "approvalDetails.approvedAt": new Date(),
        "approvalDetails.rejectionReason": rejectionReason
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Camp rejected successfully", 
      camp: updatedCamp 
    });
  } catch (error) {
    console.error("Error rejecting camp:", error);
    res.status(500).json({ message: "Failed to reject camp", error: error.message });
  }
};

// Get camps by approval status
export const getCampsByApprovalStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate the status parameter
    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'Pending', 'Approved', or 'Rejected'" 
      });
    }

    const camps = await Camp.find({ approvalStatus: status })
      .populate("organizer", "orgName email contact")
      .sort({ createdAt: -1 });

    res.status(200).json({ camps });
  } catch (error) {
    console.error(`Error fetching ${req.params.status} camps:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Original controller methods with minor updates where needed

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

    // Check if the update is substantial and needs re-approval
    const camp = await Camp.findById(id);
    
    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }
    
    // Determine if this update should reset approval status
    const resetFields = ['name', 'description', 'operatingHours', 'location', 'address', 'availableDates'];
    const needsReapproval = Object.keys(updates).some(key => resetFields.includes(key));
    
    // If substantial changes were made and camp was previously approved, reset to pending
    if (needsReapproval && camp.approvalStatus === "Approved") {
      updates.approvalStatus = "Pending";
      updates["approvalDetails.approvedAt"] = null;
      updates["approvalDetails.rejectionReason"] = null;
    }

    const updatedCamp = await Camp.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      camp: updatedCamp,
      message: needsReapproval ? 
        "Camp updated successfully and sent for re-approval" : 
        "Camp updated successfully"
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating camp", error: error.message });
  }
};

export const getCampsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    const camps = await Camp.find({ organizer: organizerId });

    if (camps.length === 0) {
      return res
        .status(404)
        .json({ message: "No camps found for this organizer" });
    }

    res.status(200).json({ camps });
  } catch (error) {
    console.error("Error fetching camps by organizer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUpcomingCampsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    const currentDate = new Date();

    const camps = await Camp.find({
      organizer: organizerId,
      availableDates: { $elemMatch: { $gt: currentDate } },
    });

    if (camps.length === 0) {
      return res
        .status(404)
        .json({ message: "No upcoming camps found for this organizer" });
    }

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

// Get organizer's camps by approval status
export const getOrganizerCampsByApprovalStatus = async (req, res) => {
  try {
    const { organizerId, status } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'Pending', 'Approved', or 'Rejected'" 
      });
    }

    const camps = await Camp.find({ 
      organizer: organizerId,
      approvalStatus: status 
    }).sort({ createdAt: -1 });

    res.status(200).json({ camps });
  } catch (error) {
    console.error(`Error fetching ${req.params.status} camps for organizer:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};