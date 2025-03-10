import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.adminToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin still exists
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin no longer exists" });
    }

    // Add admin to request
    req.admin = {
      id: admin._id,
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check if admin is superadmin
export const isSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === "superadmin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied, superadmin role required" });
  }
};

// Middleware to check if admin is moderator or superadmin
export const isModeratorOrSuperAdmin = (req, res, next) => {
  if (
    req.admin &&
    (req.admin.role === "moderator" || req.admin.role === "superadmin")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({
        message: "Access denied, moderator or superadmin role required",
      });
  }
};

// Middleware to check if admin is support or superadmin
export const isSupportOrSuperAdmin = (req, res, next) => {
  if (
    req.admin &&
    (req.admin.role === "support" || req.admin.role === "superadmin")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied, support or superadmin role required" });
  }
};
