import Camp from "../models/Camp.js";

// Create a new blood donation camp
export const createCamp = async (req, res) => {
  try {
    const {
      name,
      description,
      operatingHours,
      lat,
      lng,
      address,
      status,
      availableDates,
      contact,
    } = req.body;

    // Validation: Ensure required fields are provided
    if (
      !name ||
      !operatingHours ||
      !lat ||
      !lng ||
      !address ||
      !contact ||
      !availableDates
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Ensure that the address object has all necessary fields
    const { street, city, postalCode } = address;
    if (!street || !city || !postalCode) {
      return res.status(400).json({ error: "Address fields are incomplete" });
    }

    // Create a new Camp instance with provided data
    const newCamp = new Camp({
      name,
      description,
      operatingHours,
      location: { type: "Point", coordinates: [lng, lat] }, // GeoJSON format
      address,
      status: status || "Upcoming", // Default to "Upcoming" if not provided
      availableDates: availableDates,
      contact,
    });

    // Save the new camp to the database
    await newCamp.save();

    // Respond with success message and the created camp data
    res
      .status(201)
      .json({ message: "Camp created successfully", camp: newCamp });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ error: "Failed to create camp", details: error.message });
  }
};

// Fetch nearby blood donation camps using $geoNear
export const getNearbyCamps = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: "Missing location parameters" });
    }

    const nearbyCamps = await Camp.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance", // Distance in meters
          maxDistance: parseFloat(radius) * 1000, // Convert km to meters
          spherical: true,
        },
      },
      {
        $addFields: {
          distance: {
            $cond: {
              if: { $lt: ["$distance", 1000] }, // If distance is less than 1000 meters
              then: { $round: ["$distance", 0] }, // Show in meters (rounded to nearest integer)
              else: { $round: [{ $divide: ["$distance", 1000] }, 2] }, // Show in kilometers (rounded to 2 decimal places)
            },
          },
          distanceUnit: {
            $cond: {
              if: { $lt: ["$distance", 1000] }, // If distance is less than 1000 meters
              then: "m", // Unit is meters
              else: "km", // Unit is kilometers
            },
          },
        },
      },
    ]);

    res.status(200).json(nearbyCamps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby camps" });
  }
};
// GET all camps
export const getCamps = async (req, res) => {
  try {
    const camps = await Camp.find();
    res.status(200).json(camps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching camps", error });
  }
};

// Update a blood donation camp by ID
export const updateCamp = async (req, res) => {
  try {
    const { id } = req.params; // Get camp ID from request parameters
    const { name, address, date, lat, lng, status } = req.body; // New details to update

    // Find the camp by its ID
    const camp = await Camp.findById(id);
    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    // Update the camp's details
    camp.name = name || camp.name;
    camp.address = address || camp.address;
    camp.date = date || camp.date;
    camp.location =
      lat && lng ? { type: "Point", coordinates: [lng, lat] } : camp.location;
    camp.status = status || camp.status; // Update status if provided

    // Save the updated camp
    await camp.save();
    res.status(200).json({ message: "Camp updated successfully", camp });
  } catch (error) {
    res.status(500).json({ error: "Failed to update camp" });
  }
};

// Delete a blood donation camp by ID
export const deleteCamp = async (req, res) => {
  try {
    const { id } = req.params; // Get camp ID from request parameters

    // Check if the camp exists
    const camp = await Camp.findById(id);
    if (!camp) {
      return res.status(404).json({ error: "Camp not found" });
    }

    // Delete the camp
    await Camp.findByIdAndDelete(id); // Instead of camp.remove()
    res.status(200).json({ message: "Camp deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete camp" });
  }
};
