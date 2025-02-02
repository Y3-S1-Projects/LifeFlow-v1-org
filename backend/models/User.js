// Import Mongoose
import mongoose from "mongoose";

// Define the schema for Donation History
const DonationHistorySchema = new mongoose.Schema({
  donationDate: {
    type: Date,
    required: true,
  },
  donationCenter: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
});

// Define the User schema
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  // Fields for blood donation eligibility
  nicNo: {
    type: String,
    default: null,
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    default: null,
  },
  dateOfBirth: {
    type: String,
    default: null,
  },
  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zipCode: { type: String, default: null },
  },
  healthConditions: {
    type: [String], // List of conditions (e.g., ["Diabetes", "Hypertension"])
    default: [],
  },
  drugUsage: {
    type: Boolean, // True if the user is using drugs
    default: false,
  },
  lastDonationDate: {
    type: Date,
    default: null,
  },
  donatedBefore: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  additionalInfo: {
    type: String,
    default: null,
  },
  isVerified: { type: Boolean, default: false },
  donationHistory: [DonationHistorySchema],
  isEligible: {
    type: Boolean,
    default: false, // Default to false until all fields are filled
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to check eligibility
UserSchema.pre("save", function (next) {
  // Check if the user has filled all required fields for eligibility
  if (
    this.nicNo &&
    this.bloodType &&
    this.dateOfBirth &&
    this.address.street &&
    this.address.city &&
    this.address.state &&
    this.address.zipCode &&
    !this.drugUsage
  ) {
    this.isEligible = true;
  } else {
    this.isEligible = false;
  }
  next();
});

// Export the model
export default mongoose.model("User", UserSchema);
