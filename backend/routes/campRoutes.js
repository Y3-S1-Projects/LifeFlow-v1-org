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
  getOrganizerCampsByApprovalStatus,
  getPendingApprovalCamps,
  approveCamp,
  rejectCamp,
  getCampsByApprovalStatus,
  getAllCamps
} from "../controllers/campController.js";

const router = express.Router();

// Original routes
router.post("/create", createCamp);
router.get("/nearby", getNearbyCamps);
router.get("/all", getCamps);
router.get("/all-camps", getAllCamps); // New route to get
router.delete("/delete/:id", deleteCamp);
router.put("/update/:id", updateCamp);
router.get("/:campId/users", getUsersRegisteredInCamp);
router.get("/get-camps/:organizerId", getCampsByOrganizer);
router.get("/get-upcoming-camps/:organizerId", getUpcomingCampsByOrganizer);
router.get("/:id", getCampById);

// New routes for organizer camp status
router.get("/organizer/:organizerId/status/:status", getOrganizerCampsByApprovalStatus);

// Admin-like routes for approval management (all integrated in camp controller)
router.get("/admin/pending", getPendingApprovalCamps);
router.put("/admin/approve/:id", approveCamp);
router.put("/admin/reject/:id", rejectCamp);
router.get("/admin/status/:status", getCampsByApprovalStatus);

export default router;