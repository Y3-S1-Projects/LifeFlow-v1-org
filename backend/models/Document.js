import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['license', 'registration', 'permit', 'compliance', 'other']
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Add index for better query performance
documentSchema.index({ organizerId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ verified: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;