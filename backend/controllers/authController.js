import User from "../models/User.js";
import Otp from "../models/OTP.js";
import nodemailer from "nodemailer";
import emailService from "../services/emailService.js";
import dotenv from "dotenv";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import PasswordResetToken from "../models/PasswordResetToken.js";

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_FRONTEND
    : process.env.LOCAL_FRONTEND;

// Nodemailer configuration
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password (not Gmail password)
  },
});

// OTP Configuration
const MAX_OTP_ATTEMPTS = 3;
const OTP_COOLDOWN = 60 * 1000; // 1 minute
const OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes

export const sendOTP = async (email) => {
  const recentOtp = await Otp.findOne({
    email,
    createdAt: { $gte: new Date(Date.now() - OTP_COOLDOWN) },
  });

  if (recentOtp) {
    throw new Error("Please wait before requesting a new OTP");
  }

  const generateNumericOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Then use it in your sendOTP function:
  const otp = generateNumericOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({ email });
  await new Otp({
    email,
    otp,
    expiresAt,
    createdAt: new Date(),
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
      return res.status(429).json({
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

    const totalLifetime = 15 * 60 * 1000; // 15 minutes total

    // Check if OTP is expired
    if (
      otpRecord.createdAt &&
      Date.now() - otpRecord.createdAt.getTime() > totalLifetime
    ) {
      await Otp.deleteOne({ email });
      return res.status(400).json({
        message: "OTP request has expired. Please request a new OTP.",
      });
    }

    // Find the user to get their name for personalization
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as verified and reset attempts count
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    // Reset OTP attempts on successful verification
    await Otp.updateOne({ email }, { $set: { attempts: 0 } });

    // Delete OTP after successful verification
    await Otp.deleteOne({ email });

    // Send verification confirmation email
    try {
      await emailService.sendTemplateEmail({
        to: email,
        subject: "Email Verification Successful",
        templateParams: {
          title: "Email Verified",
          preheader: "Your Account is Now Verified",
          userName: user.firstName || "Valued User",
          mainMessage:
            "Your email has been successfully verified. You can now access your account.",
          details: [{ label: "Verified Email", value: email }],
          actionButton: {
            text: "Go to Dashboard",
            link: "http://localhost/donor/dashboard",
          },
          additionalInfo:
            "If you did not perform this verification, please contact our support team.",
        },
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Note: We don't return an error here as the OTP verification was successful
    }

    res.status(200).json({
      message: "OTP verified successfully. You can now log in.",
      user: updatedUser,
    });
  } catch (err) {
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.create({ userId: user._id, token, expiresAt });

    const resetLink = `${FRONTEND_URL}/donor/reset-password?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    await emailService.sendTemplateEmail({
      to: email,
      subject: "LifeFlow - Password Reset Request",
      templateParams: {
        title: "Password Reset",
        preheader: "Reset your LifeFlow account password",
        userName: user.name || "LifeFlow User",
        mainMessage:
          "We received a request to reset your password. Click the button below to set a new password:",
        actionButton: { text: "Reset Password", link: resetLink },
        additionalInfo:
          "This link will expire in 1 hour. If you didn’t request this, please ignore this email.",
        companyName: "LifeFlow",
      },
    });

    res.status(200).json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid reset request" });

    const resetToken = await PasswordResetToken.findOne({
      userId: user._id,
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await PasswordResetToken.deleteMany({ userId: user._id });

    await emailService.sendTemplateEmail({
      to: email,
      subject: "LifeFlow - Password Reset Confirmation",
      templateParams: {
        title: "Password Updated",
        preheader: "Your password has been successfully reset",
        userName: user.name || "LifeFlow User",
        mainMessage:
          "Your LifeFlow account password has been successfully updated.",
        additionalInfo:
          "If you did not make this change, please contact our support team immediately.",
        companyName: "LifeFlow",
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
