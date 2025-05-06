// controllers/statsController.js

import Camp from "../models/Camp.js";
import User from "../models/User.js";

// Get user cities data
export const getUserCities = async (req, res) => {
  try {
    const userCities = await User.aggregate([
      { $match: { "address.city": { $exists: true, $ne: null } } },
      { $group: { _id: "$address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: "$_id", users: "$count", _id: 0 } },
    ]);

    res.status(200).json(userCities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user cities", error: error.message });
  }
};

// Get camp cities data
export const getCampCities = async (req, res) => {
  try {
    const campCities = await Camp.aggregate([
      { $match: { "address.city": { $exists: true, $ne: null } } },
      { $group: { _id: "$address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: "$_id", camps: "$count", _id: 0 } },
    ]);

    res.status(200).json(campCities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching camp cities", error: error.message });
  }
};

// Get combined location data (camps and donors by city)
export const getLocationStats = async (req, res) => {
  try {
    // First get camp counts by city
    const campStats = await Camp.aggregate([
      { $match: { "address.city": { $exists: true, $ne: null } } },
      { $group: { _id: "$address.city", camps: { $sum: 1 } } },
    ]);

    // Then get donor counts by city (users who have donated)
    const donorStats = await User.aggregate([
      {
        $match: {
          "address.city": { $exists: true, $ne: null },
          donationHistory: { $exists: true, $not: { $size: 0 } },
        },
      },
      { $group: { _id: "$address.city", donors: { $sum: 1 } } },
    ]);

    // Combine the data
    const locationStats = campStats
      .map((camp) => {
        const donorCity = donorStats.find((d) => d._id === camp._id);
        return {
          name: camp._id,
          camps: camp.camps,
          donors: donorCity ? donorCity.donors : 0,
        };
      })
      .sort((a, b) => b.donors - a.donors);

    res.status(200).json(locationStats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching location stats", error: error.message });
  }
};

// Get donors by blood type
export const getBloodTypeStats = async (req, res) => {
  try {
    const bloodTypeStats = await User.aggregate([
      { $match: { bloodType: { $exists: true, $ne: "not sure" } } },
      { $group: { _id: "$bloodType", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
    ]);

    res.status(200).json(bloodTypeStats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching blood type stats",
      error: error.message,
    });
  }
};

// Get donation trends (monthly)
export const getDonationTrends = async (req, res) => {
  try {
    // This is a simplified version - you might need to adjust based on how you track donations
    const donationTrends = await User.aggregate([
      { $unwind: "$donationHistory" },
      {
        $group: {
          _id: {
            year: { $year: "$donationHistory.donationDate" },
            month: { $month: "$donationHistory.donationDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: [
                  "$$monthsInString",
                  { $subtract: ["$_id.month", 1] },
                ],
              },
            },
          },
          donors: "$count",
          _id: 0,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json(donationTrends);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching donation trends",
      error: error.message,
    });
  }
};

// Get summary stats
export const getSummaryStats = async (req, res) => {
  try {
    const [totalCamps, totalDonors, totalOrganizers] = await Promise.all([
      Camp.countDocuments(),
      User.countDocuments({ "donationHistory.0": { $exists: true } }),
      User.countDocuments({ role: "Organizer" }),
    ]);

    res.status(200).json({ totalCamps, totalDonors, totalOrganizers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching summary stats", error: error.message });
  }
};
