import mongoose from "mongoose";

const AdminOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attempts: {
    type: Number,
    default: 0,
  },
});

const AdminOTP = mongoose.model("AdminOTP", AdminOTPSchema);
export default AdminOTP;
