import Organizer from "../models/Organizer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Document from "../models/Document.js";
import upload from "../config/multerConfig.js";
import fs from "fs";
import path from "path";

export const registerOrganizer = async (req, res) => {
  try {
    const {
      orgName,
      orgType,
      regNumber,
      yearEstablished,
      website,
      firstName,
      lastName,
      email,
      phone,
      position,
      licenseNumber,
      validityPeriod,
      previousCamps,
      address,
      city,
      state,
      pincode,
      facilities,
      equipmentList,
      password,
    } = req.body;

    // Check if organizer already exists
    const existingOrganizer = await Organizer.findOne({ email });
    if (existingOrganizer) {
      console.log("Organizer already exists with email:", email);
      return res
        .status(400)
        .json({ message: "Organizer already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Password hashed successfully");

    // Create new organizer
    const newOrganizer = new Organizer({
      orgName,
      orgType,
      regNumber,
      yearEstablished,
      website,
      firstName,
      lastName,
      email,
      phone,
      position,
      licenseNumber,
      validityPeriod,
      previousCamps,
      address,
      city,
      state,
      pincode,
      facilities,
      equipmentList,
      password: hashedPassword, // Save the hashed password
      role: "Organizer",
      isVerified: false,
      eligibleToOrganize: false,
      createdCamps: [],
    });

    await newOrganizer.save();

    res.status(201).json({
      message: "Organizer registered successfully",
      organizer: {
        id: newOrganizer._id,
        orgName: newOrganizer.orgName,
        firstName: newOrganizer.firstName,
        lastName: newOrganizer.lastName,
        email: newOrganizer.email,
      },
    });
  } catch (error) {
    console.error("Error registering organizer:", error);
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
    const {
      orgName,
      orgType,
      regNumber,
      yearEstablished,
      website,
      firstName,
      lastName,
      email,
      phone,
      position,
      licenseNumber,
      validityPeriod,
      previousCamps,
      address,
      city,
      state,
      pincode,
      facilities,
      equipmentList,
    } = req.body;

    const updatedFields = {
      orgName,
      orgType,
      regNumber,
      yearEstablished,
      website,
      firstName,
      lastName,
      email,
      phone,
      position,
      licenseNumber,
      validityPeriod,
      previousCamps,
      address,
      city,
      state,
      pincode,
      facilities,
      equipmentList,
    };

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
    // if (isMultipleFields && !req.isAuthenticated) {
    //   return res.status(401).json({
    //     message: "Authentication required to update multiple fields.",
    //   });
    // }

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

export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findByIdAndUpdate(
      documentId,
      { verified: true },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({
      message: "Document verified successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error verifying document",
      error: error.message,
    });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const organizerId = req.body.organizerId;
    console.log("Organizer ID:", organizerId);
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const savedDocuments = await Promise.all(
      files.map(async (file) => {
        const newDocument = new Document({
          organizerId,
          documentType: req.body.documentType || "other",
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
        });
        return await newDocument.save();
      })
    );

    // Update organizer to mark documents as uploaded
    await Organizer.findByIdAndUpdate(organizerId, {
      $set: { documentsUploaded: true },
    });

    res.status(201).json({
      message: "Documents uploaded successfully",
      documents: savedDocuments.map((doc) => ({
        id: doc._id,
        name: doc.originalName,
        type: doc.documentType,
        size: doc.fileSize,
        uploadedAt: doc.uploadDate,
      })),
    });
  } catch (error) {
    console.error("Error uploading documents:", error);

    // Clean up uploaded files if error occurs
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    res.status(500).json({
      message: "Server error during document upload",
      error: error.message,
    });
  }
};

//Get all documents uploaded by the organizer
export const getOrganizerDocuments = async (req, res) => {
  try {
    const organizerId = req.query.organizerId || req.organizer.id;
    const documents = await Document.find({ organizerId })
      .select("-filePath -__v")
      .sort({ uploadDate: -1 });

    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({
      message: "Server error fetching documents",
      error: error.message,
    });
  }
};

// Download a document
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      organizerId: req.organizer.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.join(process.cwd(), document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    res.status(500).json({
      message: "Server error downloading document",
      error: error.message,
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.documentId,
      organizerId: req.organizer.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete the physical file
    try {
      fs.unlinkSync(document.filePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error deleting document",
      error: error.message,
    });
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

// Get organizers who are not eligible to organize
export const getIneligibleOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find({
      eligibleToOrganize: false,
    }).select("-password");

    res.status(200).json({ organizers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update organizer status and eligibility
export const updateOrganizerStatus = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const organizer = await Organizer.findByIdAndUpdate(
      organizerId,
      {
        status,
        eligibleToOrganize: status === "approved", // Automatically set eligibility
      },
      { new: true }
    ).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      message: `Organizer ${status} successfully`,
      organizer,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      message: "Error updating status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
