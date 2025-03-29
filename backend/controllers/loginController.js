import User from "../models/User.js";
import Organizer from "../models/Organizer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/OTP.js";
import { sendOTP } from "./authController.js";
import emailService from "../services/emailService.js";
import axios from "axios";

// Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

// Login function
export const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid credentials. Please check your email and password.",
      });
    }

    if (!user.isVerified) {
      await sendOTP(email);
      return res.status(403).json({
        message: "Authentication failed. Please check your email.",
        requiresVerification: true,
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || "User" },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "1d" } // Token expires in 7 days if rememberMe is true
    );

    // Set cookie expiration based on rememberMe
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
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
            { label: "IP Address", value: clientIP },
            { label: "Location", value: locationInfo },
          ],
          additionalInfo:
            "If this was not you, please contact our support team immediately.",
          actionButton: {
            text: "View Account Security",
            link: `${process.env.FRONTEND_URL}/account/security`,
          },
        },
      });
    } catch (emailError) {
      console.error("Login notification email failed:", emailError);
    }

    // Return minimal user info - don't include token in body
    res.status(200).json({
      message: "Login successful",
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
    res
      .status(500)
      .json({ message: "Authentication failed. Please try again." });
  }
};

// Improved helper function to get the client's IP address
export function getClientIP(req) {
  let ip;

  // Check for x-forwarded-for header (common in proxies and load balancers)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // Take the first IP from the list
    ip = forwardedFor.split(",")[0].trim();
  } else {
    // Fallback to other headers or direct IP
    ip =
      req.headers["x-real-ip"] || req.ip || req.connection.remoteAddress || "";
  }

  // Handle IPv6 to IPv4 mapped addresses (::ffff:)
  if (ip && ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Final validation
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return "Local Development";
  }

  return ip;
}

// Function to get location data from IP
async function getLocationFromIP(ip) {
  if (
    ip === "Unknown" ||
    ip === "127.0.0.1" ||
    ip.includes("192.168.") ||
    ip.includes("10.")
  ) {
    return { country: "Unknown (Local Network)" };
  }

  try {
    // Using ipapi.co free service - consider using a paid service for production
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    if (response.data && response.data.country_name) {
      return {
        country: response.data.country_name,
        city: response.data.city,
        region: response.data.region,
      };
    }
    return { country: "Unknown" };
  } catch (error) {
    console.error("IP geolocation error:", error.message);
    return { country: "Unknown" };
  }
}

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
