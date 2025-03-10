// routes/userRoutes.js
import express from "express";
import { verifyOTP, resendOTP } from "../controllers/authController.js";
import {
  registerUser,
  getUsers,
  getUserDetails,
  updateUser,
  addDonationRecord,
  deleteUser,
  getUserDonationHistory,
} from "../controllers/userController.js";
import {
  authenticateUser,
  authorizeRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Protected routes
router.get("/allUsers", getUsers);
router.get("/donation-history", getUserDonationHistory);
router.get("/getUserDetails/:id", getUserDetails);
router.put("/updateUser/:id", updateUser);
router.post("/addUserDonationRecord/:id", addDonationRecord);
router.delete("/deleteUser/:id", deleteUser);

export default router;
