// routes/statsRoutes.js

import express from "express";
import {
  getUserCities,
  getCampCities,
  getLocationStats,
  getBloodTypeStats,
  getDonationTrends,
  getSummaryStats,
} from "../controllers/statsController.js";

const router = express.Router();

router.get("/user-cities", getUserCities);
router.get("/camp-cities", getCampCities);
router.get("/location-stats", getLocationStats);
router.get("/blood-type-stats", getBloodTypeStats);
router.get("/donation-trends", getDonationTrends);
router.get("/summary-stats", getSummaryStats);

export default router;
