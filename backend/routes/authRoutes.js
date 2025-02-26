import express from "express";
import { logoutUser } from "../middleware/authMiddleware.js"; // Adjust path as needed

const router = express.Router();

router.post("/logout", logoutUser);

export default router;
