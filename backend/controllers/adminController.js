import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import AdminOTP from "../models/AdminOTP.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Add this function to your adminController.js

export const initializeFirstAdmin = async (req, res) => {
  try {
    // Check if any admin exists already
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        message: "Admin already initialized. Use regular registration.",
      });
    }

    const {
      fullName,
      firstName,
      lastName,
      email,
      password,
      role,
      nic,
      address,
    } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If firstName or lastName are not provided, extract them from fullName
    const parsedFirstName = firstName || fullName.split(" ")[0];
    const parsedLastName =
      lastName || fullName.split(" ").slice(1).join(" ") || "";

    // Create first admin with superadmin role
    const newAdmin = new Admin({
      fullName,
      firstName: parsedFirstName,
      lastName: parsedLastName,
      email,
      password: hashedPassword,
      role: "superadmin", // Force first admin to be superadmin
      nic,
      address: address || {},
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "First admin initialized successfully",
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login admin
// export const loginAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find admin by email
//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: admin._id, role: admin.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // Set HTTP-only cookie with token
//     res.cookie("adminToken", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     // Send admin data (excluding password)
//     const adminData = {
//       id: admin._id,
//       fullName: admin.fullName,
//       email: admin.email,
//       role: admin.role,
//     };

//     res.status(200).json({ success: true, admin: adminData });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const sendAdminOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await AdminOTP.deleteMany({ email });
  await new AdminOTP({
    email,
    otp,
    expiresAt,
    createdAt: new Date(),
    attempts: 0,
  }).save();

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
          <div class="logo">LifeFlow Admin Portal</div>
          <div class="message">
            <p>Hello Admin,</p>
            <p>Your admin login verification code is:</p>
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 5 minutes.</p>
          </div>
          <div class="message">
            <p>If you didn't request this code, please secure your account immediately.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from LifeFlow. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} LifeFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "LifeFlow Admin - Login Verification Code",
    text: `Your LifeFlow admin verification code is ${otp}. It is valid for 5 minutes.`,
    html: htmlContent,
  };

  console.log("Sending mail with options:", mailOptions);
  await transporter.sendMail(mailOptions);
  console.log("Mail sent successfully");
  return true;
};

// Modified login controller with 1st step authentication
export const loginAdmin = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    // Verify reCAPTCHA
    //if (!captchaToken) {
    //  return res.status(400).json({ message: "CAPTCHA verification required" });
    //}
    //// Verify captcha with Google
    // const captchaVerification = await fetch(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    //  { method: "POST" }
    // );

    // const captchaResult = await captchaVerification.json();
    // console.log("captchaResult", captchaResult);

    // if (!captchaResult.success) {
    //  return res.status(400).json({ message: "CAPTCHA verification failed" });
    //}

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Password is correct, proceed to 2FA
    // Send OTP to admin email
    await sendAdminOTP(email);

    // Return success but indicate that OTP verification is required
    res.status(200).json({
      success: true,
      requireOTP: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// New controller for OTP verification
export const verifyAdminOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Find OTP record
    const otpRecord = await AdminOTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await AdminOTP.deleteOne({ email });
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new code.",
      });
    }

    // Check OTP validity
    if (otpRecord.otp !== otp) {
      await AdminOTP.updateOne({ email }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await AdminOTP.deleteOne({ email });
      return res.status(400).json({ message: "Verification code expired" });
    }

    // OTP is valid - generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie with token
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Delete OTP after successful verification
    await AdminOTP.deleteOne({ email });

    // Send admin data
    const adminData = {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    };

    res.status(200).json({ success: true, admin: adminData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend OTP
export const resendAdminOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if there's a recent OTP (less than 1 minute old)
    const recentOtp = await AdminOTP.findOne({
      email,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOtp) {
      return res.status(429).json({
        message: "Please wait before requesting a new code",
        retryAfter: 60, // seconds
      });
    }

    await sendAdminOTP(email);
    res.status(200).json({ message: "New verification code sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout admin
export const logoutAdmin = (req, res) => {
  res.cookie("adminToken", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Register new admin (superadmin only)
export const registerAdmin = async (req, res) => {
  try {
    // Check if requester is superadmin
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      fullName,
      firstName,
      lastName,
      email,
      password,
      role,
      nic,
      address,
    } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { nic }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message:
          existingAdmin.email === email
            ? "Email already in use"
            : "NIC already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      fullName,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      nic,
      role,
      address,
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, firstName, lastName, address } = req.body;

    // Find admin and update
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (fullName) admin.fullName = fullName;
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (address) admin.address = address;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        address: admin.address,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Change admin password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find admin
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);

    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all admins (superadmin only)
export const getAllAdmins = async (req, res) => {
  try {
    // Check if requester is superadmin
    //if (req.admin.role !== "superadmin") {
    //  return res.status(403).json({ message: "Not authorized" });
    //}

    const admins = await Admin.find().select("-password");

    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve a user (moderator and superadmin)
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Add user to admin's approved users list
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if user already approved by this admin
    const alreadyApproved = admin.approvedUsers.some(
      (approval) => approval.userId.toString() === userId
    );

    if (alreadyApproved) {
      return res.status(400).json({ message: "User already approved" });
    }

    admin.approvedUsers.push({
      userId,
      approvedAt: new Date(),
    });

    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "User approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve an organizer (moderator and superadmin)
export const approveOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if organizer already approved by this admin
    const alreadyApproved = admin.approvedOrganizers.some(
      (approval) => approval.organizerId.toString() === organizerId
    );

    if (alreadyApproved) {
      return res.status(400).json({ message: "Organizer already approved" });
    }

    admin.approvedOrganizers.push({
      organizerId,
      approvedAt: new Date(),
    });

    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Organizer approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve a camp (moderator and superadmin)
export const approveCamp = async (req, res) => {
  try {
    const { campId } = req.params;

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if camp already approved by this admin
    const alreadyApproved = admin.approvedCamps.some(
      (approval) => approval.campId.toString() === campId
    );

    if (alreadyApproved) {
      return res.status(400).json({ message: "Camp already approved" });
    }

    admin.approvedCamps.push({
      campId,
      approvedAt: new Date(),
    });

    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Camp approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Handle support ticket (support and superadmin)
export const handleSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Check if admin role is support or superadmin
    if (req.admin.role !== "support" && req.admin.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if ticket already handled by this admin
    const alreadyHandled = admin.handledSupportTickets.some(
      (ticket) => ticket.ticketId.toString() === ticketId
    );

    if (alreadyHandled) {
      return res.status(400).json({ message: "Ticket already handled by you" });
    }

    admin.handledSupportTickets.push({
      ticketId,
      handledAt: new Date(),
    });

    await admin.save();

    res
      .status(200)
      .json({ success: true, message: "Support ticket handled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all support admins (no authentication required)
export const getAllSupportAdmins = async (req, res) => {
  try {
    // Find all admins with the role "support"
    const supportAdmins = await Admin.find({ role: "support" }).select(
      "-password"
    );

    res.status(200).json({ success: true, supportAdmins });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a support admin (no authentication required)
export const updateSupportAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ID of the support admin to update
    const { fullName, firstName, lastName, email, address, nic } = req.body;

    // Find the support admin by ID and role
    const supportAdmin = await Admin.findOne({ _id: id, role: "support" });
    if (!supportAdmin) {
      return res.status(404).json({ message: "Support admin not found" });
    }

    // Update fields if provided
    if (fullName) supportAdmin.fullName = fullName;
    if (firstName) supportAdmin.firstName = firstName;
    if (lastName) supportAdmin.lastName = lastName;
    if (email) supportAdmin.email = email;
    if (address) supportAdmin.address = address;
    if (nic) supportAdmin.nic = nic;

    await supportAdmin.save();

    res.status(200).json({
      success: true,
      message: "Support admin updated successfully",
      admin: {
        id: supportAdmin._id,
        fullName: supportAdmin.fullName,
        firstName: supportAdmin.firstName,
        lastName: supportAdmin.lastName,
        email: supportAdmin.email,
        role: supportAdmin.role,
        address: supportAdmin.address,
        nic: supportAdmin.nic,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Delete a support admin (superadmin only)
export const deleteSupportAdmin = async (req, res) => {
  try {
    // Check if requester is superadmin
    //if (req.admin.role !== "superadmin") {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    const { id } = req.params; // ID of the support admin to delete

    // Find and delete the support admin by ID and role
    const supportAdmin = await Admin.findOneAndDelete({
      _id: id,
      role: "support",
    });
    if (!supportAdmin) {
      return res.status(404).json({ message: "Support admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Support admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
