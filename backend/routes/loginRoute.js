import express from "express";
import {
  loginUser,
  logoutUser,
  verifyLoginOTP,
} from "../controllers/loginController.js";
import { getUserDetails } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();
const app = express();

app.use(express.json()); // This is essential for parsing the body

// Authentication routes
router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOTP);

// Protected route to get user details
router.get("/me", authenticateUser, getUserDetails);
router.post("/logout", authenticateUser, logoutUser);

export default router;
