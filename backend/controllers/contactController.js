import ContactMessage from "../models/ContactMessage.js";

// POST: Send a new contact message
export const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate request data
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Save message to MongoDB
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error saving contact message:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET: Fetch all contact messages (for admin/support)
export const getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resolveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message and update its resolved status
    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { resolved: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message marked as resolved",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error resolving message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
