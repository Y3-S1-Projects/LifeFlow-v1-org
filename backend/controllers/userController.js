import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";

// Nodemailer configuration

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password (not Gmail password)
  },
});

export const sendOTP = async (email) => {
  const generateNumericOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Then use it in your sendOTP function:
  const otp = generateNumericOTP();

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Otp.deleteMany({ email });
  await new Otp({ email, otp, expiresAt }).save();

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
          <div class="logo">LifeFlow</div>
          <div class="message">
            <p>Hello,</p>
            <p>Thank you for using LifeFlow - where every drop saves lives. Please use the following OTP to verify your email address:</p>
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 5 minutes.</p>
          </div>
          <div class="message">
            <p>If you didn't request this code, please ignore this email.</p>
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
    subject: "LifeFlow - Your OTP Code",
    text: `Your LifeFlow OTP code is ${otp}. It is valid for 5 minutes.`,
    html: htmlContent, // Adding HTML content
  };

  await transporter.sendMail(mailOptions);
};

// User registration with OTP verification
export const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    bloodType,
    dateOfBirth,
    phoneNumber,
    address,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      bloodType,
      dateOfBirth,
      phoneNumber,
      address,
      isVerified: false, // Set to false until OTP verification
    });

    await newUser.save();
    await sendOTP(email); // Send OTP for verification

    res
      .status(201)
      .json({ message: "User registered. Please verify your email with OTP." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const MAX_OTP_ATTEMPTS = 3;
const OTP_COOLDOWN = 60 * 1000; // 1 minute

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found" });
    }

    // Check if too many attempts have been made
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ email }); // Delete OTP after too many attempts
      res.status(429).json({
        message: "Too many attempts. Please request a new OTP.",
        attempts: otpRecord.attempts, // Include the current attempts count in the response
      });
    }

    // Check if OTP is valid
    if (otpRecord.otp !== otp) {
      // Increment attempts after failed OTP
      await Otp.updateOne({ email }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ email }); // Delete expired OTP
      return res
        .status(400)
        .json({ message: "OTP expired, please request a new one" });
    }

    // Mark user as verified and reset attempts count
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Reset OTP attempts on successful verification
    await Otp.updateOne({ email }, { $set: { attempts: 0 } });

    // Delete OTP after successful verification
    await Otp.deleteOne({ email });

    res.status(200).json({
      message: "OTP verified successfully. You can now log in.",
      user,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Internal server error, please try again later" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendOTP(email); // Send new OTP
    res.status(200).json({ message: "OTP sent again. Check your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a user by ID
export const getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(req.user.userId).select({
      fullName: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      bloodType: 1,
      isVerified: 1,
      phoneNumber: 1,
      address: 1,
      dateOfBirth: 1,
      isEligible: 1,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a user's information
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add a donation record for a user
export const addDonationRecord = async (req, res) => {
  const { id } = req.params;
  const { donationDate, donationCenter, notes } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.donationHistory.push({ donationDate, donationCenter, notes });
    user.lastDonationDate = donationDate;
    await user.save();

    res.status(200).json({ message: "Donation record added", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
