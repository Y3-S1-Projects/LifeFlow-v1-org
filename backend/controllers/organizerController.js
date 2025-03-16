// controllers/organizerController.js
import Organizer from "../models/Organizer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register a new organizer
export const registerOrganizer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      organization,
      address,
    } = req.body;

    // Check if organizer already exists
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      return res
        .status(400)
        .json({ message: "Organizer already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new organizer
    const newOrganizer = new Organizer({
      fullName: `${firstName} ${lastName}`, // Combine first and last name for fullName
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      organization,
      address, // Assuming address is an object with street, city, and state
      role: "Organizer", // Default role
      isVerified: false, // Default verification status
      eligibleToOrganize: false, // Default eligibility status
      createdCamps: [], // Initialize empty array for created camps
    });

    await newOrganizer.save();

    res.status(201).json({
      message: "Organizer registered successfully",
      organizer: {
        id: newOrganizer._id,
        fullName: newOrganizer.fullName,
        firstName: newOrganizer.firstName,
        lastName: newOrganizer.lastName,
        email: newOrganizer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Login organizer
export const loginOrganizer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if organizer exists
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if verified
    if (!organizer.isVerified) {
      return res.status(403).json({
        message: "Account not verified",
        requiresVerification: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: organizer._id,
        role: "Organizer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set token in HTTP-only cookie with proper configuration
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/", // Important! Make cookie available site-wide
    });

    // Return token in response as well (for redundancy)
    res.status(200).json({
      message: "Login successful",
      token, // Include token in response for localStorage backup
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        eligibleToOrganize: organizer.eligibleToOrganize,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get organizer profile
export const getOrganizerProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizer.id).select(
      "-password"
    );

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({ organizer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update organizer profile
export const updateOrganizerProfile = async (req, res) => {
  try {
    const { name, phone, organization } = req.body;

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    if (organization) updatedFields.organization = organization;

    const organizer = await Organizer.findByIdAndUpdate(
      req.organizer.id,
      { $set: updatedFields },
      { new: true }
    ).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      organizer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update organizer profile (general update)
export const updateOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const updateData = req.body;

    // Check if more than one field is being updated and require authentication
    const isMultipleFields = Object.keys(updateData).length > 1;

    // If more than one field is being updated, require authentication
    if (isMultipleFields && !req.isAuthenticated) {
      return res.status(401).json({
        message: "Authentication required to update multiple fields.",
      });
    }

    // Find the organizer by ID and update the fields
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure that all validation rules are applied
      }
    );

    if (!updatedOrganizer) {
      return res.status(404).json({ message: "Organizer not found." });
    }

    return res
      .status(200)
      .json({ message: "Organizer updated successfully.", updatedOrganizer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the organizer.",
      error,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get organizer with password
    const organizer = await Organizer.findById(req.organizer.id);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, organizer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    organizer.password = hashedPassword;
    await organizer.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify organizer account (admin function)
export const verifyOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const organizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      message: "Organizer verified successfully",
      organizer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Set eligibility status (admin function)
export const setEligibilityStatus = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { eligibleToOrganize } = req.body;

    const organizer = await Organizer.findByIdAndUpdate(
      organizerId,
      { eligibleToOrganize },
      { new: true }
    ).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      message: `Organizer eligibility ${
        eligibleToOrganize ? "granted" : "revoked"
      } successfully`,
      organizer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all organizers (admin function)
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find().select("-password");
    res.status(200).json({ organizers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete organizer (admin function or self-delete)
export const deleteOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    // Check if it's self-delete or admin
    if (req.organizer.id !== organizerId && !req.organizer.isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this account" });
    }

    const organizer = await Organizer.findByIdAndDelete(organizerId);

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({ message: "Organizer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get organizer's created camps
export const getOrganizerCamps = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.organizer.id)
      .populate("createdCamps")
      .select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({ camps: organizer.createdCamps });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
