import FAQ from "../models/FAQ.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllFAQs = catchAsync(async (req, res, next) => {
  const faqs = await FAQ.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: {
      faqs
    }
  });
});

export const createFAQ = catchAsync(async (req, res, next) => {
  const { question, answer } = req.body;
  
  if (!question || !answer) {
    return next(new AppError('Please provide both question and answer', 400));
  }

  const newFAQ = await FAQ.create({ question, answer });

  res.status(201).json({
    status: 'success',
    data: {
      faq: newFAQ
    }
  });
});

export const deleteFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});