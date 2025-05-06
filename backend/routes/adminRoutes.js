import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  registerAdmin,
  updateAdminProfile,
  changePassword,
  getAllAdmins,
  approveUser,
  approveOrganizer,
  approveCamp,
  handleSupportTicket,
  initializeFirstAdmin,
  verifyAdminOTP,
  resendAdminOTP,
  sendAdminOTP,
  getAllSupportAdmins,
  updateSupportAdmin, // Import the new controller
  deleteSupportAdmin, // Import the new controller
} from "../controllers/adminController.js";
import {
  adminAuth,
  isSuperAdmin,
  isModeratorOrSuperAdmin,
  isSupportOrSuperAdmin,
} from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);
router.post("/initialize", initializeFirstAdmin); // Add this special route for first admin

router.post("/send-otp", sendAdminOTP);
// Protected routes
router.post("/logout", logoutAdmin);
router.get("/profile", adminAuth, getAdminProfile);
router.put("/profile", adminAuth, updateAdminProfile);
router.put("/change-password", adminAuth, changePassword);

// Superadmin routes
router.post("/register", adminAuth, isSuperAdmin, registerAdmin);
router.get("/all", getAllAdmins);

// Moderator/Superadmin routes
router.post(
  "/approve-user/:userId",
  adminAuth,
  isModeratorOrSuperAdmin,
  approveUser
);
router.post(
  "/approve-organizer/:organizerId",
  adminAuth,
  isModeratorOrSuperAdmin,
  approveOrganizer
);
router.post(
  "/approve-camp/:campId",
  adminAuth,
  isModeratorOrSuperAdmin,
  approveCamp
);

// Support/Superadmin routes
router.post(
  "/support-ticket/:ticketId",
  adminAuth,
  isSupportOrSuperAdmin,
  handleSupportTicket
);

router.post("/login", loginAdmin);
router.post("/verify-otp", verifyAdminOTP);
router.post("/resend-otp", resendAdminOTP);

router.get("/support-admins", getAllSupportAdmins);

router.put("/support-admins/:id", updateSupportAdmin);
router.delete("/support-admins/:id", deleteSupportAdmin);

export default router;
