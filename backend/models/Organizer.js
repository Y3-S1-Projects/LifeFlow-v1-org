import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
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
  password: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
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
  phone: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  createdCamps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp", // Reference to the Camp schema
    },
  ],
});

const Organizer = mongoose.model("Organizer", organizerSchema);

export default Organizer;
