import mongoose from "mongoose";

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
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  isAssessmentCompleted: {
    type: Boolean,
    default: false,
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

// Pre-save middleware to check eligibility
UserSchema.pre("save", function (next) {
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
  next();
});

export default mongoose.model("User", UserSchema);
