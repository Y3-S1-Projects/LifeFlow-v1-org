import express from "express";
import { sendMessage, getMessages } from "../controllers/contactController.js";

const router = express.Router();

// Route to send a new contact message
router.post("/send", sendMessage);

// Route to get all contact messages (for admin/support dashboard)
router.get("/messages", getMessages);

export default router;
