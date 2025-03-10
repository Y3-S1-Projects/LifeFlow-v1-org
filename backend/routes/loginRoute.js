import express from "express";
import {
  loginUser,
  logoutUser,
  verifyLoginOTP,
} from "../controllers/loginController.js";
import { getUserDetails } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const app = express();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many login attempts, please try again later" },
});

app.use(express.json()); // This is essential for parsing the body

// Authentication routes
router.post("/login", loginLimiter, loginUser);
router.post("/verify-login-otp", verifyLoginOTP);

// Protected route to get user details
router.get("/me", authenticateUser, getUserDetails);
router.post("/logout", authenticateUser, logoutUser);

export default router;
