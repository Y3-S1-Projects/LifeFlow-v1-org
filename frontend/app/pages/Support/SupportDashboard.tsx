"use client";
import SupportHeader from "@/app/components/SupportHeader";
import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Users,
  MapPin,
  Activity,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  Mail,
  User,
  X,
  Plus,
  Trash2,
  HelpCircle,
  Edit,
  Search,
  Download,
  Info,
  FileText,
  Star,
  ArrowUp,
  ArrowDown,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Filter,
  BarChart2,
  Layers,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { SupportTab } from "./components/SupportTab";
import { usePDF } from "react-to-pdf";
import ConfirmDialog from "./components/ConfirmDialog";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  resolved: boolean;
  region?: string;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  helpfulCount: number;
  notHelpfulCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQFeedback {
  _id: string;
  faqId: FAQ;
  helpful: boolean;
  comment: string;
  createdAt: string;
}

interface FAQStat {
  _id: string;
  question: string;
  helpfulCount: number;
  notHelpfulCount: number;
  viewCount: number;
  helpfulRatio: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const SupportDashboard = () => {
  // Function to truncate long text - moved to the top to avoid initialization issues
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]);
  const [activeMessages, setActiveMessages] = useState<ContactMessage[]>([]);
  const [resolvedMessages, setResolvedMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "support" | "faq-management" | "faq-viewer" | "faq-feedback"
  >("overview");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // PDF export ref and hook
  const reportRef = useRef(null);
  const { toPDF, targetRef } = usePDF({
    filename: `support_report_${new Date().toISOString().split('T')[0]}.pdf`,
  });

  // FAQ states
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "", category: "General" });
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editFAQData, setEditFAQData] = useState({ question: "", answer: "", category: "" });
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState("all");
  const [faqSortOrder, setFaqSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest");
  
  // FAQ Feedback states
  const [faqFeedback, setFaqFeedback] = useState<FAQFeedback[]>([]);
  const [faqStats, setFaqStats] = useState<FAQStat[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async (): Promise<void> => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(data.csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, []);

  // Fetch messages from API
  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/contact/messages`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      
      // Assign random regions to messages for demo purposes
      // Remove this in production and use actual regions from your data
      const regions = ["Colombo", "Kandy", "Kurunagala", "Malabe", "Others"];
      const messagesWithRegions = data.map((msg: ContactMessage) => ({
        ...msg,
        resolved: msg.resolved || false,
        region: regions[Math.floor(Math.random() * regions.length)] // Remove this line in production
      }));

      setAllMessages(messagesWithRegions);
      setFilteredMessages(messagesWithRegions);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load messages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMessages(showResolved ? resolvedMessages : activeMessages);
    } else {
      const filtered = (
        showResolved ? resolvedMessages : activeMessages
      ).filter((message) =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchTerm, showResolved, activeMessages, resolvedMessages]);

  // Fetch FAQs from API
  const fetchFAQs = async () => {
    setIsFaqLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch FAQs: ${response.status}`);
      }
      const data = await response.json();
      setFaqs(data.data.faqs);
    } catch (err) {
      console.error("Fetch FAQs error:", err);
      setError("Failed to load FAQs. Please try again.");
    } finally {
      setIsFaqLoading(false);
    }
  };

  // Fetch FAQ feedback
  const fetchFAQFeedback = async () => {
    setIsFeedbackLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs/feedback`);
      if (!response.ok) {
        throw new Error(`Failed to fetch FAQ feedback: ${response.status}`);
      }
      const data = await response.json();
      setFaqFeedback(data.data.feedback || []);
    } catch (err) {
      console.error("Fetch FAQ feedback error:", err);
      setError("Failed to load FAQ feedback. Please try again.");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Fetch FAQ stats
  const fetchFAQStats = async () => {
    setIsFeedbackLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs/stats`);
      if (!response.ok) {
        throw new Error(`Failed to fetch FAQ stats: ${response.status}`);
      }
      const data = await response.json();
      setFaqStats(data.data.stats || []);
    } catch (err) {
      console.error("Fetch FAQ stats error:", err);
      setError("Failed to load FAQ statistics. Please try again.");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Record FAQ view
  const recordFAQView = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/faqs/${id}/view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Record FAQ view error:", err);
    }
  };

  // Submit FAQ feedback
  const submitFAQFeedback = async (id: string, helpful: boolean) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/faqs/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ 
          helpful, 
          comment: feedbackComment 
        }),
      });

      // Update local state to show feedback was submitted
      setFeedbackSubmitted(prev => ({
        ...prev,
        [id]: true
      }));
      
      // Clear comment
      setFeedbackComment("");
      
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error("Submit FAQ feedback error:", err);
      toast.error("Failed to submit feedback");
    }
  };

  // Create new FAQ
  const handleCreateFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) {
      setError("Please fill both question and answer fields");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(newFAQ),
      });

      if (!response.ok) {
        throw new Error(`Failed to create FAQ: ${response.status}`);
      }

      const data = await response.json();
      setFaqs([data.data.faq, ...faqs]);
      setNewFAQ({ question: "", answer: "", category: "General" });
      setError(null);
      toast.success("FAQ created successfully!");
    } catch (err) {
      console.error("Create FAQ error:", err);
      setError("Failed to create FAQ. Please try again.");
      toast.error("Failed to create FAQ");
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setFaqToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Delete FAQ with confirmation
  const handleDeleteFAQ = async () => {
    if (!faqToDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs/${faqToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete FAQ: ${response.status}`);
      }

      setFaqs(faqs.filter((faq) => faq._id !== faqToDelete));
      setError(null);
      toast.success("FAQ deleted successfully!");
    } catch (err) {
      console.error("Delete FAQ error:", err);
      setError("Failed to delete FAQ. Please try again.");
      toast.error("Failed to delete FAQ");
    } finally {
      setIsDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };

  // Start editing FAQ
  const startEditingFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setEditFAQData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General"
    });
  };

  // Cancel editing FAQ
  const cancelEditingFAQ = () => {
    setEditingFAQ(null);
    setEditFAQData({ question: "", answer: "", category: "" });
  };

  // Update FAQ
  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    if (!editFAQData.question || !editFAQData.answer) {
      setError("Please fill both question and answer fields");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/faqs/${editingFAQ._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(editFAQData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update FAQ: ${response.status}`);
      }

      const data = await response.json();
      setFaqs(
        faqs.map((faq) => (faq._id === editingFAQ._id ? data.data.faq : faq))
      );
      cancelEditingFAQ();
      setError(null);
      toast.success("FAQ updated successfully!");
    } catch (err) {
      console.error("Update FAQ error:", err);
      setError("Failed to update FAQ. Please try again.");
      toast.error("Failed to update FAQ");
    }
  };

  // Toggle FAQ expansion
  const toggleFaqExpansion = (id: string) => {
    if (expandedFaq !== id) {
      // Record view when expanding a FAQ
      recordFAQView(id);
    }
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Filter and sort FAQs
  const getFilteredAndSortedFAQs = () => {
    let filteredFaqs = [...faqs];
    
    // Filter by category if not "all"
    if (faqCategory !== "all") {
      filteredFaqs = filteredFaqs.filter(faq => faq.category === faqCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      filteredFaqs = filteredFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort FAQs
    if (faqSortOrder === "newest") {
      filteredFaqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (faqSortOrder === "oldest") {
      filteredFaqs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (faqSortOrder === "alphabetical") {
      filteredFaqs.sort((a, b) => a.question.localeCompare(b.question));
    }
    
    return filteredFaqs;
  };

  // Get unique FAQ categories
  const getFAQCategories = () => {
    const categories = new Set(faqs.map(faq => faq.category || "General"));
    return ["all", ...Array.from(categories)];
  };

  // Update active/resolved messages when allMessages changes
  useEffect(() => {
    const resolved = allMessages.filter((msg) => msg.resolved);
    const active = allMessages.filter((msg) => !msg.resolved);

    setResolvedMessages(resolved);
    setActiveMessages(active);
    setFilteredMessages(showResolved ? resolved : active);
  }, [allMessages, showResolved]);

  // Initial data fetch
  useEffect(() => {
    fetchMessages();
    fetchFAQs();
  }, []);

  // Fetch feedback data when feedback tab is activated
  useEffect(() => {
    if (activeTab === "faq-feedback") {
      fetchFAQFeedback();
      fetchFAQStats();
    }
  }, [activeTab]);

  // Function to prepare data for the Cases by Region pie chart
  const prepareCasesByRegionData = () => {
    // Count cases by region
    const regionCounts = activeMessages.reduce((acc, message) => {
      // Use optional chaining and type assertion to avoid TypeScript errors
      const region = (message as any).region || "Others";
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format needed for the pie chart
    const data = Object.entries(regionCounts).map(([name, value]) => ({
      name,
      value,
    }));
  
    // If no data, return default
    return data.length > 0 ? data : [
      { name: "Colombo", value: 35 },
      { name: "Kandy", value: 28 },
      { name: "Kurunagala", value: 12 },
      { name: "Malabe", value: 18 },
      { name: "Others", value: 7 },
    ];
  };
  
  // Function to prepare data for the Weekly Case Load bar chart
  const prepareWeeklyCaseData = () => {
    // Get dates for the last 7 days - corrected order to match UI
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const result = Array(7).fill().map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        day: days[i], // Use index directly since we've ordered the array correctly
        date: date,
        cases: 0
      };
    });
    
    // Count messages by day
    activeMessages.forEach(message => {
      const messageDate = new Date(message.createdAt);
      // Check if message date is within the last 7 days
      result.forEach(day => {
        if (messageDate.toDateString() === day.date.toDateString()) {
          day.cases += 1;
        }
      });
    });
  
    return result.map(({ day, cases }) => ({ day, cases }));
  };

  // Prepare FAQ feedback data for charts
  const prepareFAQFeedbackData = () => {
    // Count helpful vs not helpful feedback
    const helpfulCount = faqFeedback.filter(f => f && f.helpful).length;
    const notHelpfulCount = faqFeedback.filter(f => f && !f.helpful).length;
    
    return [
      { name: "Helpful", value: helpfulCount },
      { name: "Not Helpful", value: notHelpfulCount }
    ];
  };

  // Prepare FAQ view data for charts
  const prepareFAQViewData = () => {
    if (!faqStats || faqStats.length === 0) {
      return [];
    }
    
    return faqStats
      .filter(stat => stat && stat.question) // Add this filter to prevent null errors
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(stat => ({
        name: truncateText(stat.question, 30),
        views: stat.viewCount
      }));
  };

  // Chart data
  const caseData = prepareCasesByRegionData();
  const weeklyCaseData = prepareWeeklyCaseData();
  const feedbackData = prepareFAQFeedbackData();
  const viewData = prepareFAQViewData();

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#A28DFF"];
  const FEEDBACK_COLORS = ["#4CAF50", "#F44336"];

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Function to export active cases as CSV
  const exportActiveCasesCSV = () => {
    // Create CSV headers
    const headers = ["ID", "Name", "Email", "Subject", "Region", "Date Created"];
    
    // Map data to CSV rows
    const csvData = activeMessages.map(msg => [
      msg._id,
      msg.name,
      msg.email,
      msg.subject,
      (msg as any).region || "Others",
      new Date(msg.createdAt).toLocaleDateString()
    ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `active_cases_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to export FAQ feedback as CSV
  const exportFAQFeedbackCSV = () => {
    // Create CSV headers
    const headers = ["FAQ Question", "Helpful", "Comment", "Date"];
    
    // Map data to CSV rows
    const csvData = faqFeedback
      .filter(feedback => feedback && feedback.faqId && feedback.faqId.question) // Add null check
      .map(feedback => [
        feedback.faqId.question,
        feedback.helpful ? "Yes" : "No",
        feedback.comment || "No comment",
        new Date(feedback.createdAt).toLocaleDateString()
      ]);
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faq_feedback_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <SupportHeader />

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`py-4 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "support"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Support
            </button>
            <button
              onClick={() => setActiveTab("faq-management")}
              className={`py-4 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "faq-management"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              FAQ Management
            </button>
            <button
              onClick={() => setActiveTab("faq-viewer")}
              className={`py-4 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "faq-viewer"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              FAQ Viewer
            </button>
            <button
              onClick={() => setActiveTab("faq-feedback")}
              className={`py-4 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "faq-feedback"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              FAQ Feedback
            </button>
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Activity className="mr-2 text-red-500" />
                  Support Dashboard
                </h1>
                <p className="text-gray-500 mt-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-red-400" />
                  Blood Camp Finder Support Overview
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Live Updates
                </div>
                <button 
                  onClick={() => toPDF()} 
                  className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </button>
                <button 
                  onClick={exportActiveCasesCSV} 
                  className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Content to be exported as PDF */}
            <div ref={targetRef}>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors duration-200">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Active Cases
                      </p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors duration-200">
                        {activeMessages.length}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">+8%</span>
                    <span className="ml-1">from last week</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4 group-hover:bg-red-100 transition-colors duration-200">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Requests
                      </p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-red-600 transition-colors duration-200">
                        34
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">+12%</span>
                    <span className="ml-1">from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4 group-hover:bg-green-100 transition-colors duration-200">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Calls Today
                      </p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-green-600 transition-colors duration-200">
                        28
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">+5%</span>
                    <span className="ml-1">from yesterday</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4 group-hover:bg-purple-100 transition-colors duration-200">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Avg Response
                      </p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-purple-600 transition-colors duration-200">
                        14 min
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    <span className="text-green-500 font-medium">-2 min</span>
                    <span className="ml-1">from last week</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-500" />
                    Cases by Region
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={caseData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {caseData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieCustomTooltip />} />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-500" />
                    Weekly Case Load
                  </h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={weeklyCaseData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <XAxis dataKey="day" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="cases"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                          barSize={36}
                        >
                          {weeklyCaseData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 3 ? "#8884d8" : "#a794f7"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Active Cases Table for PDF */}
              <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Active Cases Summary
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeMessages.slice(0, 5).map((message) => (
                        <tr key={message._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800">{message.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{truncateText(message.subject, 30)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{(message as any).region || "Others"}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{new Date(message.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Tab Content */}
        {activeTab === "support" && <SupportTab />}

        {/* Enhanced FAQ Management Tab Content */}
        {activeTab === "faq-management" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <HelpCircle className="h-6 w-6 mr-2 text-purple-500" />
                  FAQ Management
                </h2>
                <p className="text-gray-500 mt-1">
                  Create, edit, and manage frequently asked questions for your users
                </p>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button
                  onClick={fetchFAQs}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh FAQs
                </button>
                <button
                  onClick={() => {
                    setNewFAQ({ question: "", answer: "", category: "General" });
                    document.getElementById("faq-create-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New FAQ
                </button>
              </div>
            </div>

            {/* FAQ Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total FAQs</p>
                    <h3 className="text-3xl font-bold mt-1">{faqs.length}</h3>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Recently Added</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {faqs.filter(faq => {
                        const date = new Date(faq.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7;
                      }).length}
                    </h3>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-6 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm">Last Updated</p>
                    <h3 className="text-lg font-bold mt-1">
                      {faqs.length > 0 
                        ? new Date(Math.max(...faqs.map(faq => new Date(faq.updatedAt).getTime()))).toLocaleDateString() 
                        : "No FAQs yet"}
                    </h3>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Sorting and Filtering */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFaqSortOrder("newest")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                      faqSortOrder === "newest"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setFaqSortOrder("oldest")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                      faqSortOrder === "oldest"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => setFaqSortOrder("alphabetical")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                      faqSortOrder === "alphabetical"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } transition-colors`}
                  >
                    A-Z
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full md:w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search FAQs..."
                />
              </div>
            </div>

            {/* Enhanced Create FAQ Form with Charm Colors */}
<div id="faq-create-section" className="bg-red-50 rounded-lg p-6 mb-8 border border-red-100 shadow-sm">
  <div className="flex items-center mb-4">
    <div className="bg-red-500 p-2.5 rounded-full mr-3 shadow-sm">
      <Plus className="h-5 w-5 text-white" />
    </div>
    <h3 className="text-xl font-bold text-red-600">Create New FAQ</h3>
  </div>
  
  <div className="space-y-5">
    <div>
      <label
        htmlFor="question"
        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
      >
        <HelpCircle className="h-4 w-4 mr-2 text-red-500" />
        Question
      </label>
      <input
        type="text"
        id="question"
        value={newFAQ.question}
        onChange={(e) =>
          setNewFAQ({ ...newFAQ, question: e.target.value })
        }
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
        placeholder="Enter question here..."
      />
    </div>
    
    <div>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
      >
        <Layers className="h-4 w-4 mr-2 text-red-500" />
        Category
      </label>
      <input
        type="text"
        id="category"
        value={newFAQ.category}
        onChange={(e) =>
          setNewFAQ({ ...newFAQ, category: e.target.value })
        }
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
        placeholder="Enter category (e.g., General, Donations, Registration)"
      />
    </div>
    
    <div>
      <label
        htmlFor="answer"
        className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
      >
        <MessageSquare className="h-4 w-4 mr-2 text-red-500" />
        Answer
      </label>
      <textarea
        id="answer"
        value={newFAQ.answer}
        onChange={(e) =>
          setNewFAQ({ ...newFAQ, answer: e.target.value })
        }
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
        placeholder="Enter detailed answer here..."
      ></textarea>
    </div>
    
    <div className="flex justify-end">
      <button
        onClick={handleCreateFAQ}
        className="px-6 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create FAQ
      </button>
    </div>
  </div>
</div>


            {/* FAQ List */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Existing FAQs
              </h3>
              {isFaqLoading ? (
                <div className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Loading FAQs...</p>
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-6">
                  {getFilteredAndSortedFAQs()
                    .filter(faq => 
                      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((faq) => (
                    <div
                      key={faq._id}
                      className={`bg-white rounded-lg border ${
                        editingFAQ && editingFAQ._id === faq._id
                          ? "border-purple-300 shadow-md"
                          : "border-gray-200 hover:border-purple-200"
                      } transition-all duration-200 overflow-hidden`}
                    >
                      {editingFAQ && editingFAQ._id === faq._id ? (
                        <div className="p-6 space-y-4 bg-purple-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-purple-800">
                              Editing FAQ
                            </h4>
                            <button
                              onClick={cancelEditingFAQ}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-question-${faq._id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Question
                            </label>
                            <input
                              type="text"
                              id={`edit-question-${faq._id}`}
                              value={editFAQData.question}
                              onChange={(e) =>
                                setEditFAQData({
                                  ...editFAQData,
                                  question: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-category-${faq._id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Category
                            </label>
                            <input
                              type="text"
                              id={`edit-category-${faq._id}`}
                              value={editFAQData.category}
                              onChange={(e) =>
                                setEditFAQData({
                                  ...editFAQData,
                                  category: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Enter category (e.g., General, Donations, Registration)"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-answer-${faq._id}`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Answer
                            </label>
                            <textarea
                              id={`edit-answer-${faq._id}`}
                              value={editFAQData.answer}
                              onChange={(e) =>
                                setEditFAQData({
                                  ...editFAQData,
                                  answer: e.target.value,
                                })
                              }
                              rows={4}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            ></textarea>
                          </div>
                          <div className="flex space-x-3 pt-2">
                            <button
                              onClick={handleUpdateFAQ}
                              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md hover:from-green-600 hover:to-emerald-600 transition-colors shadow-sm flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditingFAQ}
                              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="text-lg font-bold text-gray-800 hover:text-purple-700 cursor-pointer" onClick={() => toggleFaqExpansion(faq._id)}>
                                  {faq.question}
                                </h4>
                                <button
                                  onClick={() => toggleFaqExpansion(faq._id)}
                                  className="ml-2 text-gray-400 hover:text-gray-600"
                                >
                                  {expandedFaq === faq._id ? (
                                    <ArrowUp className="h-4 w-4" />
                                  ) : (
                                    <ArrowDown className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              {expandedFaq === faq._id && (
                                <div className="mt-3 text-gray-600 bg-gray-50 p-4 rounded-md border-l-4 border-purple-300">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={() => startEditingFAQ(faq)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit FAQ"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openDeleteDialog(faq._id)}
className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
title="Delete FAQ"
>
  <Trash2 className="h-5 w-5" />
</button>
</div>
</div>
<div className="mt-3 flex items-center text-xs text-gray-400 space-x-4">
  <span className="flex items-center">
    <Calendar className="h-3 w-3 mr-1" />
    {new Date(faq.createdAt).toLocaleDateString()}
  </span>
  <span className="flex items-center">
    <Clock className="h-3 w-3 mr-1" />
    Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
  </span>
  {faq.category && (
    <span className="flex items-center">
      <Layers className="h-3 w-3 mr-1" />
      {faq.category}
    </span>
  )}
  <span className="flex items-center">
    <Eye className="h-3 w-3 mr-1" />
    {faq.viewCount || 0} views
  </span>
</div>
</div>
)}
</div>
))}
</div>
) : (
<div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
  <div className="flex flex-col items-center justify-center">
    <HelpCircle className="h-16 w-16 text-gray-300 mb-4" />
    <h4 className="text-xl font-medium text-gray-600 mb-2">No FAQs Found</h4>
    <p className="text-gray-500 max-w-md mb-6">
      You haven't created any FAQs yet. FAQs help your users find answers to common questions quickly.
    </p>
    <button
      onClick={() => document.getElementById("faq-create-section")?.scrollIntoView({ behavior: "smooth" })}
      className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Your First FAQ
    </button>
  </div>
</div>
)}
</div>
</div>
)}

{/* FAQ Viewer Tab Content */}
{activeTab === "faq-viewer" && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
        Frequently Asked Questions
      </h2>
      
      <div className="flex space-x-2 mt-4 md:mt-0">
        <div className="relative">
          <select
            value={faqCategory}
            onChange={(e) => setFaqCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getFAQCategories().map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Search Bar */}
    <div className="mb-6 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
        placeholder="Search FAQs..."
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>

    {/* FAQ Accordion with Feedback */}
    {isFaqLoading ? (
      <div className="text-center py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-2 text-sm text-gray-500">Loading FAQs...</p>
      </div>
    ) : getFilteredAndSortedFAQs().length > 0 ? (
      <div className="space-y-6">
        {getFilteredAndSortedFAQs()
          .filter((faq) =>
            faq.question
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            faq.answer
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
          .map((faq) => (
            <div
              key={faq._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div 
                className="flex justify-between items-center cursor-pointer p-6 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                onClick={() => toggleFaqExpansion(faq._id)}
              >
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
                  {faq.question}
                </h3>
                <span className="text-blue-500 transition-transform">
                  {expandedFaq === faq._id ? (
                    <ArrowUp className="h-5 w-5" />
                  ) : (
                    <ArrowDown className="h-5 w-5" />
                  )}
                </span>
              </div>
              
              {expandedFaq === faq._id && (
                <div className="p-6 bg-white border-t border-gray-100">
                  <div className="prose max-w-none text-gray-600">
                    {faq.answer}
                  </div>
                  
                  {/* Category and metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {faq.category && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center">
                        <Layers className="h-3 w-3 mr-1" />
                        {faq.category}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(faq.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Feedback Section */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {feedbackSubmitted[faq._id] ? (
                      <div className="text-center py-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Thank you for your feedback!
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-3">Was this answer helpful?</p>
                        <div className="flex items-center space-x-3 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              submitFAQFeedback(faq._id, true);
                            }}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Yes, it helped
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              submitFAQFeedback(faq._id, false);
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center"
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            No, I need more info
                          </button>
                        </div>
                        <div>
                          <textarea
                            placeholder="Do you have any additional feedback? (optional)"
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          ></textarea>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="flex flex-col items-center justify-center">
          <HelpCircle className="h-16 w-16 text-gray-300 mb-4" />
          <h4 className="text-xl font-medium text-gray-600 mb-2">No FAQs Found</h4>
          <p className="text-gray-500 max-w-md">
            {searchTerm 
              ? `No FAQs match your search for "${searchTerm}".` 
              : faqCategory !== "all" 
                ? `No FAQs found in the "${faqCategory}" category.`
                : "No FAQs available at this time."}
          </p>
        </div>
      </div>
    )}
  </div>
)}

{/* FAQ Feedback Tab Content */}
{activeTab === "faq-feedback" && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2 text-purple-500" />
          FAQ Feedback Analysis
        </h2>
        <p className="text-gray-500 mt-1">
          Track user feedback and improve your FAQs based on user responses
        </p>
      </div>
      <div className="flex space-x-2 mt-4 md:mt-0">
        <button
          onClick={() => {
            fetchFAQFeedback();
            fetchFAQStats();
          }}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
        <button
          onClick={exportFAQFeedbackCSV}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>
    </div>

    {/* Feedback Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Feedback</p>
            <h3 className="text-3xl font-bold mt-1">{faqFeedback.length}</h3>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Helpful Responses</p>
            <h3 className="text-3xl font-bold mt-1">
              {faqFeedback.filter(f => f && f.helpful).length}
            </h3>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <ThumbsUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-lg p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Needs Improvement</p>
            <h3 className="text-3xl font-bold mt-1">
              {faqFeedback.filter(f => f && !f.helpful).length}
            </h3>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <ThumbsDown className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-purple-500" />
          Feedback Distribution
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={feedbackData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={true}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {feedbackData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FEEDBACK_COLORS[index % FEEDBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieCustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-blue-500" />
          Most Viewed FAQs
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={viewData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="views"
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {viewData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Feedback Table */}
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
        Recent Feedback
      </h3>
      {isFeedbackLoading ? (
        <div className="text-center py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Loading feedback data...</p>
        </div>
      ) : faqFeedback.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FAQ</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helpful</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faqFeedback
                .filter(feedback => feedback && feedback.faqId && feedback.faqId.question)
                .slice(0, 10)
                .map((feedback) => (
                <tr key={feedback._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{truncateText(feedback.faqId.question, 50)}</td>
                  <td className="py-3 px-4 text-sm">
                    {feedback.helpful ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <ThumbsUp className="h-3 w-3 inline mr-1" /> Helpful
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <ThumbsDown className="h-3 w-3 inline mr-1" /> Not Helpful
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {feedback.comment ? truncateText(feedback.comment, 50) : "-"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="flex flex-col items-center justify-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h4 className="text-xl font-medium text-gray-600 mb-2">No Feedback Yet</h4>
            <p className="text-gray-500 max-w-md">
              You haven't received any feedback on your FAQs yet. Feedback will appear here once users interact with your FAQs.
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Confirmation Dialog for Delete */}
<ConfirmDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
onConfirm={handleDeleteFAQ}
  title="Delete FAQ"
  message="Are you sure you want to delete this FAQ? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
/>
</div>
</div>
);
};

export default SupportDashboard;

