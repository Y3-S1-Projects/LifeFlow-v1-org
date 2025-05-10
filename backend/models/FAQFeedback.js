// models/FAQFeedback.js
import mongoose from "mongoose";

const faqFeedbackSchema = new mongoose.Schema({
  faqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
    required: true
  },
  helpful: {
    type: Boolean,
    required: true
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('FAQFeedback', faqFeedbackSchema);
