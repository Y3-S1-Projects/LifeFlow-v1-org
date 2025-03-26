import FAQ from "../models/FAQ.js";

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: faqs.length,
      data: {
        faqs,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch FAQs",
      error: err.message,
    });
  }
};

export const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both question and answer",
      });
    }

    const newFAQ = await FAQ.create({ question, answer });

    res.status(201).json({
      status: "success",
      data: {
        faq: newFAQ,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Failed to create FAQ",
      error: err.message,
    });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        status: "fail",
        message: "No FAQ found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete FAQ",
      error: err.message,
    });
  }
};
