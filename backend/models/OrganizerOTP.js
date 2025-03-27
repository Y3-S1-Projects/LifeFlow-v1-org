import mongoose from "mongoose";

const OrganizerOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 5, // Maximum allowed attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // Document will auto-delete after 15 minutes (900 seconds)
  },
});

// Index for faster querying
OrganizerOTPSchema.index({ email: 1, otp: 1 });

const OrganizerOTP = mongoose.model("OrganizerOTP", OrganizerOTPSchema);

export default OrganizerOTP;
