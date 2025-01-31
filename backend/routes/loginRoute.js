import express from "express";
import { loginUser, verifyLoginOTP } from "../controllers/loginController";

const router = express.Router();
// In your routes file
router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOTP);

export default router;
