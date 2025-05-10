// controllers/faqController.js
import FAQ from "../models/FAQ.js";
import FAQFeedback from "../models/FAQFeedback.js";

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
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both question and answer",
      });
    }

    const newFAQ = await FAQ.create({ 
      question, 
      answer,
      category: category || 'General'
    });

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

export const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide both question and answer",
      });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, category },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        status: "fail",
        message: "No FAQ found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        faq: updatedFAQ,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Failed to update FAQ",
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

export const recordFAQView = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        status: "fail",
        message: "No FAQ found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        faq,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to record view",
      error: err.message,
    });
  }
};

export const submitFAQFeedback = async (req, res) => {
  try {
    const { helpful, comment } = req.body;
    const faqId = req.params.id;

    // Update the helpful/not helpful count on the FAQ
    const updateField = helpful ? 'helpfulCount' : 'notHelpfulCount';
    await FAQ.findByIdAndUpdate(
      faqId,
      { $inc: { [updateField]: 1 } }
    );

    // Record detailed feedback if provided
    if (helpful !== undefined) {
      await FAQFeedback.create({
        faqId,
        helpful,
        comment: comment || ''
      });
    }

    res.status(200).json({
      status: "success",
      message: "Feedback recorded successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to submit feedback",
      error: err.message,
    });
  }
};

export const getFAQFeedback = async (req, res) => {
  try {
    const feedback = await FAQFeedback.find().populate('faqId');

    res.status(200).json({
      status: "success",
      results: feedback.length,
      data: {
        feedback,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch FAQ feedback",
      error: err.message,
    });
  }
};

export const getFAQStats = async (req, res) => {
  try {
    const stats = await FAQ.aggregate([
      {
        $project: {
          question: 1,
          helpfulCount: 1,
          notHelpfulCount: 1,
          viewCount: 1,
          helpfulRatio: {
            $cond: [
              { $eq: [{ $add: ["$helpfulCount", "$notHelpfulCount"] }, 0] },
              0,
              { $divide: ["$helpfulCount", { $add: ["$helpfulCount", "$notHelpfulCount"] }] }
            ]
          }
        }
      },
      { $sort: { viewCount: -1 } }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch FAQ statistics",
      error: err.message,
    });
  }
};
