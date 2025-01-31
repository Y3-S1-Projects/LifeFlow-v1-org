import jwt from "jsonwebtoken";
import User from "../models/User.js";

const blacklistedTokens = new Set(); // Store logged-out tokens

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (blacklistedTokens.has(token)) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Token has been logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Stores user info in req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// Function to blacklist a token (use in logout)
export const logoutUser = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Bad request: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  blacklistedTokens.add(token); // Add token to blacklist

  res.json({ message: "Logged out successfully" });
};
