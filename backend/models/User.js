import mongoose from "mongoose";
import moment from "moment";

const EmergencyContactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    enum: ["Spouse", "Parent", "Sibling", "Friend", "Guardian", "Other"],
    required: true,
  },
  customRelationship: {
    type: String,
    required: function () {
      return this.relationship === "Other";
    },
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
});

const DonationHistorySchema = new mongoose.Schema({
  donationDate: {
    type: Date,
    required: true,
  },
  donationType: {
    type: String,
    enum: ["Whole Blood", "Plasma", "Platelets", "Double Red Cells"],
    required: true,
  },
  donationCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Camp",
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  postDonationIssues: {
    type: String,
    default: "None",
  },
  pintsDonated: {
    type: Number,
    required: true,
  },
});

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
  role: {
    type: String,
    enum: ["Organizer", "Admin", "Support Agent", "User"],
    default: "User",
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
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  nicNo: {
    type: String,
    default: null,
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "not sure"],
    default: "not sure",
  },
  dateOfBirth: {
    type: String,
    default: "",
  },

  weight: {
    type: Number,
    default: null,
  },
  totalPintsDonated: {
    type: Number,
    default: 0,
  },
  lastPintsDonated: {
    type: Number,
    default: 0,
  },

  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
  },
  healthConditions: {
    type: [String],
    default: [],
  },
  drugUsage: {
    type: Boolean,
    default: false,
  },
  lastDonationDate: {
    type: String,
    default: "",
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
  emergencyContacts: [EmergencyContactSchema],
  isVerified: { type: Boolean, default: false },
  donationHistory: [DonationHistorySchema],
  isEligible: {
    type: Boolean,
    default: false,
  },
  isEligibleToDonate: {
    type: Boolean,
    default: false,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  isAssessmentCompleted: {
    type: Boolean,
    default: false,
  },
  nextEligibleDonationDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index(
  {
    location: "2dsphere",
  },
  {
    partialFilterExpression: {
      "location.type": "Point",
      "location.coordinates": { $exists: true, $type: "array" },
    },
  }
);

UserSchema.methods.calculateNextEligibleDonationDate = function (
  lastDonationType,
  lastDonationDate
) {
  if (!lastDonationDate) return null;

  const donationWaitPeriods = {
    "Whole Blood": 56, // 8 weeks
    Plasma: 14, // 2 weeks
    Platelets: 7, // 1 week
    "Double Red Cells": 112, // 16 weeks
  };

  // If donation type is not recognized, default to Whole Blood wait period
  const waitPeriod = donationWaitPeriods[lastDonationType] || 56;

  // Calculate next eligible date
  const nextEligibleDate = moment(lastDonationDate)
    .add(waitPeriod, "days")
    .toDate();

  // Update the nextEligibleDonationDate field
  this.nextEligibleDonationDate = nextEligibleDate;

  return nextEligibleDate;
};

// Method to update donation statistics
UserSchema.methods.updateDonationStats = function () {
  // Calculate total pints donated from donation history
  let total = 0;
  let lastDonated = 0;

  if (this.donationHistory && this.donationHistory.length > 0) {
    // Sort donation history by date (newest first)
    const sortedHistory = [...this.donationHistory].sort(
      (a, b) => new Date(b.donationDate) - new Date(a.donationDate)
    );

    // Calculate total pints
    total = this.donationHistory.reduce(
      (sum, donation) => sum + (donation.pintsDonated || 0),
      0
    );

    // Get the most recent donation amount
    lastDonated = sortedHistory[0].pintsDonated || 0;

    // Set lastDonationDate as string (matching existing schema format)
    this.lastDonationDate = moment(sortedHistory[0].donationDate).format(
      "YYYY-MM-DD"
    );

    // Update donatedBefore flag
    this.donatedBefore = "yes";
  }

  this.totalPintsDonated = total;
  this.lastPintsDonated = lastDonated;

  return {
    totalPintsDonated: total,
    lastPintsDonated: lastDonated,
  };
};

// Method to check if user is eligible to donate based on next eligible date
UserSchema.methods.checkDonationEligibility = function () {
  // Check if user is eligible at profile level
  if (!this.isEligible) {
    this.isEligibleToDonate = false;
    return false;
  }

  // If no nextEligibleDonationDate is set, user hasn't donated before or it wasn't calculated
  if (!this.nextEligibleDonationDate) {
    // If user has necessary profile data, they are eligible
    this.isEligibleToDonate = true;
    return true;
  }

  // Compare nextEligibleDonationDate with current date
  const currentDate = new Date();
  this.isEligibleToDonate = currentDate >= this.nextEligibleDonationDate;

  return this.isEligibleToDonate;
};

// Pre-save middleware to update all donation-related fields
UserSchema.pre("save", function (next) {
  // Check base eligibility (profile completeness)
  if (
    this.nicNo &&
    this.bloodType &&
    this.dateOfBirth &&
    this.address.street &&
    this.address.city &&
    this.address.state &&
    !this.drugUsage
  ) {
    this.isEligible = true;
  } else {
    this.isEligible = false;
  }

  // If there's a donation history, calculate stats and eligibility
  if (this.donationHistory.length > 0) {
    // Update donation statistics
    this.updateDonationStats();

    // Calculate next eligible donation date
    const lastDonation = this.donationHistory[this.donationHistory.length - 1];
    this.calculateNextEligibleDonationDate(
      lastDonation.donationType,
      lastDonation.donationDate
    );
  }

  // Check if eligible to donate now
  this.checkDonationEligibility();

  next();
});

export default mongoose.model("User", UserSchema);
