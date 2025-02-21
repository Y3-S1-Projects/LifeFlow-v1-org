import express from "express";
import {
  getNearbyCamps,
  createCamp,
  getCamps,
  deleteCamp,
  updateCamp,
} from "../controllers/campController.js";

const router = express.Router();

router.post("/create", createCamp); // Create a new camp
router.get("/nearby", getNearbyCamps); // Fetch nearby camps
router.get("/all", getCamps);
router.delete("/delete/:id", deleteCamp);
router.put("/update/:id", updateCamp);

export default router;
