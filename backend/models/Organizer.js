import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema({
  orgName: {
    type: String,
    required: true,
  },
  orgType: {
    type: String,
    required: true,
  },
  regNumber: {
    type: String,
    required: true,
  },
  yearEstablished: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    default: "",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  validityPeriod: {
    type: String,
    required: true,
  },
  previousCamps: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  facilities: {
    type: String,
    required: true,
  },
  equipmentList: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Organizer"],
    default: "Organizer",
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  eligibleToOrganize: {
    type: Boolean,
    default: false,
  },
  createdCamps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp", // Reference to the Camp schema
    },
  ],
  password: {
    type: String,
    required: true,
  }
});

const Organizer = mongoose.model("Organizer", organizerSchema);

export default Organizer;