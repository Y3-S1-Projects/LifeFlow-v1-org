import User from "../models/User.js";
import Organizer from "../models/Organizer.js";
import bcrypt from "bcrypt";
import { sendOTP } from "./authController.js";

// User registration with OTP verification
export const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    bloodType,
    phoneNumber,
    address,
    role,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user WITHOUT setting location field at all
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      bloodType,
      phoneNumber,
      address,
      role: role || "User",
      isVerified: false,
    });

    await newUser.save();
    await sendOTP(email);

    res
      .status(201)
      .json({ message: "User registered. Please verify your email with OTP." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a user by ID
export const getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check all possible ID field variations
    const userId = req.user.userId || req.user._id || req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    // Try User schema first
    let user = await User.findById(userId).select({
      fullName: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      bloodType: 1,
      isVerified: 1,
      phoneNumber: 1,
      address: 1,
      nicNo: 1,
      location: 1,
      dateOfBirth: 1,
      lastDonationDate: 1,
      isEligible: 1,
      weight: 1,
      isProfileComplete: 1,
      isAssessmentCompleted: 1,
      role: 1,
      emergencyContacts: 1,
      donationHistory: 1,
      totalPintsDonated: 1,
      lastPintsDonated: 1,
      healthConditions: 1,
      drugUsage: 1,
      donatedBefore: 1,
      additionalInfo: 1,
      createdAt: 1,
    });

    // If not found in User schema, try Organizer schema
    if (!user) {
      user = await Organizer.findById(userId).select({
        fullName: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        address: 1,
        role: 1,
        isVerified: 1,
        eligibleToOrganize: 1,
        organization: 1,
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userType =
      user.eligibleToOrganize !== undefined ? "organizer" : "user";

    res.status(200).json({
      ...user.toObject(),
      userType,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.lat && updates.lng) {
    // Make sure the location is stored in GeoJSON format
    updates.location = {
      type: "Point",
      coordinates: [updates.lng, updates.lat],
    };
  }

  try {
    // Find and update the user
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // Return updated user
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Add a donation record for a user
export const addDonationRecord = async (req, res) => {
  const { id } = req.params;
  const {
    donationDate,
    donationType,
    donationCenter,
    notes,
    postDonationIssues,
    pintsDonated,
  } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.donationHistory.push({
      donationDate,
      donationType,
      donationCenter,
      notes,
      postDonationIssues,
      pintsDonated,
    });
    user.lastDonationDate = donationDate;
    await user.save();

    res.status(200).json({ message: "Donation record added", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUserDonationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Use populate to get the camp information for each donation
    const user = await User.findById(id).select("donationHistory").populate({
      path: "donationHistory.donationCenter",
      model: "Camp",
      select: "name  contact address", // Select specific fields you want from Camp
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ donationHistory: user.donationHistory });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
