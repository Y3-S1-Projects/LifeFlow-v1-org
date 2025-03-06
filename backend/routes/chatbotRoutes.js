// backend/routes/chatbotRoutes.ts
import express from "express";
import { processGeminiQuery } from "../controllers/chatbotController.js";

const router = express.Router();

// POST route for processing chat queries
router.post("/gemini", processGeminiQuery);

export default router;
