import express from "express";
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from "../controllers/faqController.js";

const router = express.Router();

router
  .route('/')
  .get(getAllFAQs)
  .post(createFAQ);

router
  .route('/:id')
  .patch(updateFAQ)
  .delete(deleteFAQ);

export default router;