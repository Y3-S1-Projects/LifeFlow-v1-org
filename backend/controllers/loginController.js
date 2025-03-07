import User from "../models/User.js";
import Organizer from "../models/Organizer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Otp from "../models/OTP.js";
import { sendOTP } from "./authController.js";
import emailService from "../services/emailService.js";

// Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

// Login function
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message:
          "We couldn't find an account with that email. Please check your email or sign up.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      await sendOTP(email);
      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        requiresVerification: true,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || "User" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send login notification email
    try {
      await emailService.sendTemplateEmail({
        to: user.email,
        subject: "Login Notification",
        templateParams: {
          title: "Login Detected",
          preheader: "New Login to Your Account",
          userName: user.firstName || "Valued User",
          mainMessage:
            "A new login has been detected on your LifeFlow account.",
          details: [
            { label: "Login Time", value: new Date().toLocaleString() },
            { label: "IP Address", value: req.ip || "Unknown" },
          ],
          additionalInfo:
            "If this was not you, please contact our support team immediately.",
          actionButton: {
            text: "View Account Security",
            link: "http://localhost/account/security",
          },
        },
      });
    } catch (emailError) {
      console.error("Login notification email failed:", emailError);
      // Non-critical error, so we'll still return successful login response
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bloodType: user.bloodType,
        isVerified: user.isVerified,
        isEligible: user.isEligible,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Verify login OTP
export const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Validate OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Delete the used OTP
    await Otp.deleteOne({ email });

    // Return success response with token and user data
    res.status(200).json({
      message: "Email verified successfully. Please login again.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bloodType: user.bloodType,
        isVerified: user.isVerified,
        isEligible: user.isEligible,
      },
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    blacklistedTokens.add(token); // Add token to blacklist

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
