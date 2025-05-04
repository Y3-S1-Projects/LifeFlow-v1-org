import express from "express";
import { logoutUser } from "../middleware/authMiddleware.js"; // Adjust path as needed
import jwt from "jsonwebtoken";
import {
  resetPassword,
  forgotPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/logout", logoutUser);

router.get("/verify", (req, res) => {
  try {
    // Extract the JWT token from cookies
    const token = req.cookies.authToken;

    // If no token, it's okay - this is for public pages
    if (!token) {
      return res.status(200).json({
        authenticated: false,
        message: "No token present",
        allowPublicAccess: true,
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(200).json({
          authenticated: false,
          message: "Token has expired",
          allowPublicAccess: true,
        });
      }

      // If verification is successful, return authenticated details
      return res.status(200).json({
        authenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      });
    } catch (verificationError) {
      // For public pages, return 200 with authentication failure
      return res.status(200).json({
        authenticated: false,
        message: "Invalid token",
        allowPublicAccess: true,
      });
    }
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Authentication verification encountered an error:", error);

    return res.status(200).json({
      authenticated: false,
      message: "Authentication check failed",
      allowPublicAccess: true,
    });
  }
});

// Get current user info
router.get("/me", (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure to include the role in the response
    return res.status(200).json({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "User", // Provide fallback role
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
});

router.get("/admin/me", (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure to include the role in the response
    return res.status(200).json({
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role || "User", // Provide fallback role
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
