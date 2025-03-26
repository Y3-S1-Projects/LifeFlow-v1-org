import express from "express";
import {
  getAllFAQs,
  createFAQ,
  deleteFAQ
} from "../controllers/faqController.js";

const router = express.Router();

router
  .route('/')
  .get(getAllFAQs)
  .post( createFAQ);

router
  .route('/:id')
  .delete( deleteFAQ);

export default router;