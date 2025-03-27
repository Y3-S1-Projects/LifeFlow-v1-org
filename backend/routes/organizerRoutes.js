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
  uploadDocuments,
  getOrganizerDocuments,
  downloadDocument,
  deleteDocument,
  verifyDocument
} from "../controllers/organizerController.js";
import upload from "../config/multerConfig.js";
import { authorizeRole } from "../middleware/authMiddleware.js";
import { updateOrganizerStatus } from "../controllers/organizerController.js";

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

// Document routes
router.post(
  "/documents",
  upload.array('documents', 5), // Max 5 files
  uploadDocuments
);

router.get("/documents", getOrganizerDocuments);
router.get("/documents/:documentId/download", downloadDocument);
router.delete("/documents/:documentId", deleteDocument);

// Admin routes
router.put(
  "/documents/:documentId/verify",
  authorizeRole('Admin'),
  verifyDocument
);


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
router.get("/documents", getOrganizerDocuments);
router.patch(
  "/:organizerId/status",
  authorizeRole('Admin'),
  updateOrganizerStatus
);

export default router;