import jwt from "jsonwebtoken";
import User from "../models/User.js";
// import csrf from "csurf";

// // Use Redis or a database in production instead of in-memory
const blacklistedTokens = new Set();

// // CSRF protection middleware
// export const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   },
// });

// // Get CSRF token endpoint
// export const getCsrfToken = (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// };

export const authenticateUser = (req, res, next) => {
  // Get token from cookies instead of headers
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Unauthorized: Session expired" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Stores user info in req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};

// Function to logout (clear the cookie)
export const logoutUser = (req, res) => {
  // Add current token to blacklist if needed
  const token = req.cookies.authToken;
  if (token) {
    blacklistedTokens.add(token);
  }

  // Clear the auth cookie
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "Logged out successfully" });
};
