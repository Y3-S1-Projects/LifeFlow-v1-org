import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      street: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "moderator", "support"],
      default: "moderator",
    },
    nic: {
      type: String,
      required: true,
      unique: true,
    },
    approvedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    approvedOrganizers: [
      {
        organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    approvedCamps: [
      {
        campId: { type: mongoose.Schema.Types.ObjectId, ref: "Camp" },
        approvedAt: { type: Date, default: Date.now },
      },
    ],
    handledSupportTickets: [
      {
        ticketId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SupportTicket",
        },
        handledAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
