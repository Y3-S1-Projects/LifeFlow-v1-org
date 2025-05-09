import express from "express";
import {
  sendMessage,
  getMessages,
  resolveMessage,
} from "../controllers/contactController.js";

const router = express.Router();

// Route to send a new contact message
router.post("/send", sendMessage);

// Route to get all contact messages (for admin/support dashboard)
router.get("/messages", getMessages);

router.patch("/:id/resolve", resolveMessage);

export default router;
