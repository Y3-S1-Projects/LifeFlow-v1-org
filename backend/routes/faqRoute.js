// routes/faqRoutes.js
import express from "express";
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  recordFAQView,
  submitFAQFeedback,
  getFAQFeedback,
  getFAQStats
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

router.post('/:id/view', recordFAQView);
router.post('/:id/feedback', submitFAQFeedback);
router.get('/feedback', getFAQFeedback);
router.get('/stats', getFAQStats);

export default router;
