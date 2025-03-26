import express from "express";
import {
  registerOrganizer,
  loginOrganizer,
  getOrganizerProfile,
  updateOrganizerProfile,
  changePassword,
  verifyOrganizer,
  setEligibilityStatus,
  getAllOrganizers,
  deleteOrganizer,
  getOrganizerCamps,
  updateOrganizer,
  getIneligibleOrganizers,
} from "../controllers/organizerController.js";
import { authorizeRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerOrganizer);
router.post("/login", loginOrganizer);

// Protected routes - require authentication
router.get("/profile", getOrganizerProfile);
router.put("/profile", updateOrganizerProfile);
router.put("/update/:id", updateOrganizer);
router.put("/change-password", changePassword);
router.get("/camps", getOrganizerCamps);

// Admin routes - require admin privileges
router.get("/all", getAllOrganizers);
router.put("/verify/:organizerId", verifyOrganizer);
router.put("/eligibility/:organizerId", setEligibilityStatus);
router.delete(
  "/:organizerId",
  (req, res, next) => {
    // Allow self-delete or admin delete
    if (req.organizer.id === req.params.organizerId || req.organizer.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this account" });
    }
  },
  deleteOrganizer
);
router.get("/ineligible", getIneligibleOrganizers);


export default router;