import express from "express";
import {
  getNearbyCamps,
  createCamp,
  getCamps,
  deleteCamp,
  updateCamp,
  getUsersRegisteredInCamp,
  getCampsByOrganizer,
  getUpcomingCampsByOrganizer,
  getCampById,
  
} from "../controllers/campController.js";

const router = express.Router();

router.post("/create", createCamp);
router.get("/nearby", getNearbyCamps);
router.get("/all", getCamps);
router.delete("/delete/:id", deleteCamp);
router.put("/update/:id", updateCamp);
router.get("/:campId/users", getUsersRegisteredInCamp);
router.get("/get-camps/:organizerId", getCampsByOrganizer);
router.get("/get-upcoming-camps/:organizerId", getUpcomingCampsByOrganizer);
router.get("/:id", getCampById);



export default router;
