import express from "express";
import { logoutUser } from "../middleware/authMiddleware.js"; // Adjust path as needed
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/logout", logoutUser);

router.get("/verify", (req, res) => {
  try {
    // Extract the JWT token from cookies
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If verification is successful, return 200 OK
    return res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Authentication verification failed:", error.message);
    return res.status(401).json({ authenticated: false });
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

export default router;
