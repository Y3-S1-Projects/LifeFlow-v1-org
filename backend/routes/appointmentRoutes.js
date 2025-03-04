import express from "express";
import {
  createAppointment,
  getUserAppointments,
  cancelAppointment,
  confirmAppointment,
  updateAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/create", createAppointment);
router.get("/getByUser/:userId", getUserAppointments);
router.delete("/cancel/:id", cancelAppointment);
router.put("/update/:id", updateAppointment);
router.patch("/confirm/:id", confirmAppointment); // Admin feature

export default router;
