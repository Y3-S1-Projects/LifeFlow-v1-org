import mongoose from "mongoose";

const CampSchema = new mongoose.Schema({
  name: String,
  description: String,
  operatingHours: {
    type: String,
    required: true,
  },

  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "Full", "Upcoming"],
    default: "Upcoming",
  },
  availableDates: {
    type: [Date],
    required: true,
  },
  contact: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },

  donationHistory: [
    {
      donorName: String,
      donationDate: Date,
      amount: Number, // You can store the volume of blood donated
      remarks: String,
    },
  ],

  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizer", // Reference to the Organizer schema
    required: true,
  },
  trackedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CampSchema.index({ location: "2dsphere" });

export default mongoose.models.Camp || mongoose.model("Camp", CampSchema);
