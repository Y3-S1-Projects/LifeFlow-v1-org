import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Pre-save hook to check appointment limit
appointmentSchema.pre("save", async function (next) {
  // Only check for new appointments (not updates)
  if (this.isNew) {
    const existingAppointments = await mongoose
      .model("Appointment")
      .countDocuments({
        userId: this.userId,
        status: { $in: ["Pending", "Confirmed"] }, // Only count active appointments
      });

    if (existingAppointments >= 3) {
      throw new Error("User cannot have more than 3 active appointments");
    }
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
