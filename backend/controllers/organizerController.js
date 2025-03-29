import Organizer from "../models/Organizer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Document from "../models/Document.js";
import upload from "../config/multerConfig.js";
import OrganizerOTP from "../models/OrganizerOTP.js";
import emailService from "../services/emailService.js";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { getClientIP } from "./loginController.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password (not Gmail password)
  },
});

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
      return res
        .status(400)
        .json({ message: "Organizer already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const organizer = await Organizer.findOne({ email });

    if (!organizer || !(await bcrypt.compare(password, organizer.password))) {
      return res.status(401).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }

    // Check if organizer is verified
    if (!organizer.isVerified) {
      await sendOrganizerOTP(email); // Implement this function to send OTP to organizer's email
      return res.status(403).json({
        message:
          "Authentication failed. Please check your email for verification code.",
        requiresVerification: true,
      });
    }

    // Generate JWT token with rememberMe option
    const token = jwt.sign(
      {
        userId: organizer._id,
        email: organizer.email,
        role: "Organizer",
      },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "1d" }
    );

    // Set cookie with rememberMe option
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      path: "/",
    };

    res.cookie("authToken", token, cookieOptions);

    // Record login attempt for security logging
    const clientIP = getClientIP(req);
    let locationInfo = "Unknown";

    try {
      const geoData = await getLocationFromIP(clientIP);
      locationInfo = geoData.country || "Unknown";
      if (geoData.city) {
        locationInfo = `${geoData.city}, ${locationInfo}`;
      }
    } catch (geoError) {
      console.error("Error fetching location data:", geoError);
    }

    // Send login notification email
    try {
      await emailService.sendTemplateEmail({
        to: organizer.email,
        subject: "Login Notification",
        templateParams: {
          title: "Login Detected",
          preheader: "New Login to Your Organizer Account",
          userName: organizer.name || "Valued Organizer",
          mainMessage:
            "A new login has been detected on your LifeFlow Organizer account.",
          details: [
            { label: "Login Time", value: new Date().toLocaleString() },
            { label: "IP Address", value: clientIP },
            { label: "Location", value: locationInfo },
          ],
          additionalInfo:
            "If this was not you, please contact our support team immediately.",
          actionButton: {
            text: "View Account Security",
            link: `${process.env.FRONTEND_URL}/organizer/account/security`,
          },
        },
      });
    } catch (emailError) {
      console.error("Login notification email failed:", emailError);
    }

    // Return organizer info
    res.status(200).json({
      message: "Login successful",
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        eligibleToOrganize: organizer.eligibleToOrganize,
        isVerified: organizer.isVerified,
      },
    });
  } catch (err) {
    console.error("Organizer login error:", err);
    res.status(500).json({
      message: "Authentication failed. Please try again.",
      error: err.message,
    });
  }
};

const OTP_COOLDOWN = 60 * 1000; // 1 minute cooldown
const MAX_OTP_ATTEMPTS = 5;

export const sendOrganizerOTP = async (email) => {
  const recentOtp = await OrganizerOTP.findOne({
    email,
    createdAt: { $gte: new Date(Date.now() - OTP_COOLDOWN) },
  });

  if (recentOtp) {
    throw new Error("Please wait before requesting a new OTP");
  }

  const generateNumericOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const otp = generateNumericOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  // Delete any existing OTPs for this email
  await OrganizerOTP.deleteMany({ email });

  // Create new OTP record
  await new OrganizerOTP({
    email,
    otp,
    expiresAt,
    attempts: 0,
  }).save();

  // HTML email template with styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #ffffff;
          }
          .logo {
            color: #e74c3c;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 20px 0;
          }
          .otp-box {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            font-size: 32px;
            color: #e74c3c;
            letter-spacing: 5px;
            font-weight: bold;
          }
          .message {
            color: #555555;
            line-height: 1.6;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #888888;
            font-size: 12px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo">LifeFlow Organizer</div>
          <div class="message">
            <p>Hello Organizer,</p>
            <p>Thank you for using LifeFlow Organizer Portal. Please use the following OTP to verify your email address:</p>
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 5 minutes.</p>
          </div>
          <div class="message">
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LifeFlow Organizer Portal. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} LifeFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "LifeFlow Organizer - Your OTP Code",
    text: `Your LifeFlow Organizer OTP code is ${otp}. It is valid for 5 minutes.`,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export const verifyOrganizerOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OrganizerOTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or expired. Please request a new OTP.",
        code: "OTP_NOT_FOUND",
      });
    }

    // Check if too many attempts have been made
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await OrganizerOTP.deleteOne({ email });
      return res.status(429).json({
        message: "Too many attempts. Please request a new OTP.",
        code: "TOO_MANY_ATTEMPTS",
        attempts: otpRecord.attempts,
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OrganizerOTP.deleteOne({ email });
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
        code: "OTP_EXPIRED",
      });
    }

    // Check if OTP is valid
    if (otpRecord.otp !== otp) {
      // Increment attempts after failed OTP
      await OrganizerOTP.updateOne({ email }, { $inc: { attempts: 1 } });

      const remainingAttempts = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);

      return res.status(400).json({
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        code: "INVALID_OTP",
        remainingAttempts,
      });
    }

    // Find the organizer to verify
    const organizer = await Organizer.findOne({ email });

    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found",
        code: "ORGANIZER_NOT_FOUND",
      });
    }

    // Mark organizer as verified
    const updatedOrganizer = await Organizer.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Delete OTP after successful verification
    await OrganizerOTP.deleteOne({ email });

    // Send verification confirmation email
    try {
      await emailService.sendTemplateEmail({
        to: email,
        subject: "Organizer Email Verification Successful",
        templateParams: {
          title: "Email Verified",
          preheader: "Your Organizer Account is Now Verified",
          userName: organizer.name || "Valued Organizer",
          mainMessage:
            "Your email has been successfully verified. You can now access your organizer account.",
          details: [{ label: "Verified Email", value: email }],
          actionButton: {
            text: "Go to Dashboard",
            link: `${process.env.FRONTEND_URL}/organizer/dashboard`,
          },
          additionalInfo:
            "If you did not perform this verification, please contact our support team immediately.",
        },
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue even if email fails
    }

    res.status(200).json({
      message: "OTP verified successfully. Organizer account is now verified.",
      organizer: {
        id: updatedOrganizer._id,
        name: updatedOrganizer.name,
        email: updatedOrganizer.email,
        isVerified: updatedOrganizer.isVerified,
      },
      code: "VERIFICATION_SUCCESS",
    });
  } catch (err) {
    console.error("Organizer OTP verification error:", err);
    res.status(500).json({
      message: "Internal server error during OTP verification",
      code: "INTERNAL_ERROR",
    });
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
