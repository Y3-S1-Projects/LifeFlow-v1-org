import express from "express";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  getUsers,
  getUserById,
  updateUser,
  addDonationRecord,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/allUsers", getUsers);
router.get("/getUserById/:id", getUserById);
router.put("/updateUser/:id", updateUser);
router.post("/addUserDonationRecord/:id/donations", addDonationRecord);
router.delete("/deleteUser/:id", deleteUser);

export default router;
