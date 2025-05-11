import { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Home,
  Mail
} from "lucide-react";
import Link from "next/link";
import Footer from "../components/Footer";
import { toast } from "sonner";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const FAQPage: NextPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [faqCategory, setFaqCategory] = useState("all");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/csrf-token`, {
          credentials: "include",
        });
        const { data } = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        // ignore
      }
    };
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/faqs`);
        if (!response.ok) throw new Error(`Failed to fetch FAQs: ${response.status}`);
        const data = await response.json();
        setFaqs(data.data.faqs);
      } catch (err) {
        setError("Failed to load FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const getFilteredFAQs = () => {
    let filtered = [...faqs];
    if (faqCategory !== "all") filtered = filtered.filter(faq => faq.category === faqCategory);
    if (searchTerm.trim() !== "")
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return filtered;
  };

  const getFAQCategories = () => {
    const categories = new Set(faqs.map(faq => faq.category || "General"));
    return ["all", ...Array.from(categories)];
  };

  const handleCommentChange = (faqId: string, comment: string) => {
    setFeedbackComments(prev => ({
      ...prev,
      [faqId]: comment
    }));
  };

  const handleFeedback = async (faqId: string, helpful: boolean) => {
    try {
      // Record view when submitting feedback to ensure accurate stats
      await fetch(`${API_BASE_URL}/api/v1/faqs/${faqId}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
      
      // Submit the feedback with the comment specific to this FAQ
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs/${faqId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          helpful,
          comment: feedbackComments[faqId] || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`);
      }

      setFeedbackSubmitted(prev => ({ ...prev, [faqId]: true }));
      // Clear just this FAQ's comment after submission
      setFeedbackComments(prev => ({
        ...prev,
        [faqId]: ""
      }));
      toast.success("Thank you for your feedback!");
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7fafd]">
      {/* Navigation buttons */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="text-blue-600 mr-2" size={24} />
            Support Center
          </h1>
          <div className="flex space-x-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <Home size={20} className="mr-1" />
              <span>Home</span>
            </Link>
            <Link href="/contact" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <Mail size={20} className="mr-1" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-10 flex justify-center">
        <div className="w-full px-2 md:px-8 lg:px-32">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="text-blue-600" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 mb-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              value={faqCategory}
              onChange={e => setFaqCategory(e.target.value)}
            >
              {getFAQCategories().map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
          ) : getFilteredFAQs().length === 0 ? (
            <div className="text-center text-gray-500 py-10">No FAQs found.</div>
          ) : (
            <div className="space-y-5">
              {getFilteredFAQs().map(faq => (
                <div
                  key={faq._id}
                  className="rounded-xl overflow-hidden border border-blue-100 w-full"
                >
                  {/* Question row */}
                  <button
                    className={`w-full flex items-center justify-between px-6 py-4 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none`}
                    onClick={() =>
                      setExpandedFaq(expandedFaq === faq._id ? null : faq._id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-blue-600" size={22} />
                      <span className="text-base md:text-lg font-semibold text-blue-900">
                        {faq.question}
                      </span>
                    </div>
                    {expandedFaq === faq._id ? (
                      <ChevronUp className="text-blue-600" />
                    ) : (
                      <ChevronDown className="text-blue-600" />
                    )}
                  </button>
                  {/* Answer */}
                  {expandedFaq === faq._id && (
                    <div className="bg-white px-6 pb-6 pt-3 border-t border-blue-100">
                      <div className="text-gray-800 mb-3">{faq.answer}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                        <span>
                          {new Date(faq.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="mb-2 text-gray-700 font-medium">
                          Was this answer helpful?
                        </div>
                        {feedbackSubmitted[faq._id] ? (
                          <div className="text-green-600">
                            Thank you for your feedback!
                          </div>
                        ) : (
                          <div>
                            <div className="flex gap-2 mb-2">
                              <button
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition"
                                onClick={() => handleFeedback(faq._id, true)}
                              >
                                <ThumbsUp size={16} /> Yes, it helped
                              </button>
                              <button
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition"
                                onClick={() => handleFeedback(faq._id, false)}
                              >
                                <ThumbsDown size={16} /> No, I need more info
                              </button>
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                              placeholder="Do you have any additional feedback? (optional)"
                              value={feedbackComments[faq._id] || ""}
                              onChange={e => handleCommentChange(faq._id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default FAQPage;
