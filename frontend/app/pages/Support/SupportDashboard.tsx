"use client";
import SupportHeader from "@/app/components/SupportHeader";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const SupportDashboard = () => {
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]);
  const [activeMessages, setActiveMessages] = useState<ContactMessage[]>([]);
  const [resolvedMessages, setResolvedMessages] = useState<ContactMessage[]>(
    []
  );
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "support" | "faq-management" | "faq-viewer"
  >("overview");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // FAQ states
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editFAQData, setEditFAQData] = useState({ question: "", answer: "" });

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
  }, [API_BASE_URL]);

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
      const messagesWithResolved = data.map((msg: ContactMessage) => ({
        ...msg,
        resolved: msg.resolved || false,
      }));

      setAllMessages(messagesWithResolved);
      setFilteredMessages(messagesWithResolved);
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
      setNewFAQ({ question: "", answer: "" });
      setError(null);
    } catch (err) {
      console.error("Create FAQ error:", err);
      setError("Failed to create FAQ. Please try again.");
    }
  };

  // Delete FAQ
  const handleDeleteFAQ = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/faqs/${id}`, {
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

      setFaqs(faqs.filter((faq) => faq._id !== id));
      setError(null);
    } catch (err) {
      console.error("Delete FAQ error:", err);
      setError("Failed to delete FAQ. Please try again.");
    }
  };

  // Start editing FAQ
  const startEditingFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setEditFAQData({
      question: faq.question,
      answer: faq.answer,
    });
  };

  // Cancel editing FAQ
  const cancelEditingFAQ = () => {
    setEditingFAQ(null);
    setEditFAQData({ question: "", answer: "" });
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
    } catch (err) {
      console.error("Update FAQ error:", err);
      setError("Failed to update FAQ. Please try again.");
    }
  };

  // Handle resolving a message
  const handleResolveMessage = async (messageId: string) => {
    setError(null);
    try {
      const messageToResolve = allMessages.find((msg) => msg._id === messageId);

      if (!messageToResolve) {
        throw new Error("Message not found");
      }

      const updatedMessages = allMessages.map((msg) =>
        msg._id === messageId ? { ...msg, resolved: true } : msg
      );

      setAllMessages(updatedMessages);

      const response = await fetch(
        `${API_BASE_URL}/contact/messages/${messageId}/resolve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to resolve: ${response.status}`);
      }

      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Resolve error:", err);
      setError("Failed to resolve message. Please try again.");
      fetchMessages();
    }
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

  // Chart data
  const caseData = [
    { name: "Colombo", value: 35 },
    { name: "Kandy", value: 28 },
    { name: "Kurunagala", value: 12 },
    { name: "Malabe", value: 18 },
    { name: "Others", value: 7 },
  ];

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#A28DFF"];

  const weeklyCaseData = [
    { day: "Mon", cases: 4 },
    { day: "Tue", cases: 6 },
    { day: "Wed", cases: 8 },
    { day: "Thu", cases: 10 },
    { day: "Fri", cases: 9 },
    { day: "Sat", cases: 7 },
    { day: "Sun", cases: 5 },
  ];

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

  // Function to truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
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
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Live Updates
                </div>
              </div>
            </div>

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
          </div>
        )}

        {/* Support Tab Content */}
        {activeTab === "support" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                Contact Messages
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowResolved(false)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      !showResolved
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Active ({activeMessages.length})
                  </button>
                  <button
                    onClick={() => setShowResolved(true)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      showResolved
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Resolved ({resolvedMessages.length})
                  </button>
                </div>
                <button
                  onClick={fetchMessages}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all duration-200"
                placeholder="Search by name..."
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

            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[15%]" /> {/* Name */}
                  <col className="w-[20%]" /> {/* Email */}
                  <col className="w-[15%]" /> {/* Subject */}
                  <col className="w-[40%]" /> {/* Message */}
                  <col className="w-[10%]" /> {/* Actions */}
                </colgroup>
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading messages...
                        </p>
                      </td>
                    </tr>
                  ) : showResolved ? (
                    filteredMessages.length > 0 ? (
                      filteredMessages.map((msg, index) => (
                        <tr
                          key={msg._id}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            index === filteredMessages.length - 1
                              ? "rounded-b-lg"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate">
                            {msg.name}
                          </td>
                          <td
                            className="px-4 py-4 text-sm text-gray-500 truncate"
                            title={msg.email}
                          >
                            <span className="block truncate max-w-[180px]">
                              {truncateText(msg.email, 20)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 truncate">
                            {msg.subject}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500 truncate">
                            {msg.message}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedMessage(msg)}
                                className="text-blue-500 hover:text-blue-700 flex items-center"
                                title="View Full Message"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <p className="text-gray-500 flex flex-col items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
                            <span>No resolved messages found.</span>
                            {searchTerm && (
                              <span className="mt-1">
                                No matches for "{searchTerm}"
                              </span>
                            )}
                          </p>
                        </td>
                      </tr>
                    )
                  ) : filteredMessages.length > 0 ? (
                    filteredMessages.map((msg, index) => (
                      <tr
                        key={msg._id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          index === filteredMessages.length - 1
                            ? "rounded-b-lg"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate">
                          {msg.name}
                        </td>
                        <td
                          className="px-4 py-4 text-sm text-gray-500 truncate"
                          title={msg.email}
                        >
                          <span className="block truncate max-w-[180px]">
                            {truncateText(msg.email, 20)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 truncate">
                          {msg.subject}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 truncate">
                          {msg.message}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedMessage(msg)}
                              className="text-blue-500 hover:text-blue-700 flex items-center"
                              title="View Full Message"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleResolveMessage(msg._id)}
                              className="text-green-500 hover:text-green-700 flex items-center"
                              title="Resolve Message"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <p className="text-gray-500 flex flex-col items-center justify-center">
                          <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                          <span>No active messages found.</span>
                          {searchTerm && (
                            <span className="mt-1">
                              No matches for "{searchTerm}"
                            </span>
                          )}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Management Tab Content */}
        {activeTab === "faq-management" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
                FAQ Management
              </h2>
              <button
                onClick={fetchFAQs}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Add New FAQ Form */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                Add New FAQ
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="question"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Question
                  </label>
                  <input
                    type="text"
                    id="question"
                    value={newFAQ.question}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, question: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter question"
                  />
                </div>
                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Answer
                  </label>
                  <textarea
                    id="answer"
                    value={newFAQ.answer}
                    onChange={(e) =>
                      setNewFAQ({ ...newFAQ, answer: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter answer"
                  />
                </div>
                <button
                  onClick={handleCreateFAQ}
                  disabled={isFaqLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isFaqLoading ? "Adding..." : "Add FAQ"}
                </button>
              </div>
            </div>

            {/* FAQ List */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[40%]" /> {/* Question */}
                  <col className="w-[50%]" /> {/* Answer */}
                  <col className="w-[10%]" /> {/* Actions */}
                </colgroup>
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Question
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isFaqLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading FAQs...
                        </p>
                      </td>
                    </tr>
                  ) : faqs.length > 0 ? (
                    faqs.map((faq) => (
                      <tr
                        key={faq._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {editingFAQ?._id === faq._id ? (
                          <>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editFAQData.question}
                                onChange={(e) =>
                                  setEditFAQData({
                                    ...editFAQData,
                                    question: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <textarea
                                value={editFAQData.answer}
                                onChange={(e) =>
                                  setEditFAQData({
                                    ...editFAQData,
                                    answer: e.target.value,
                                  })
                                }
                                rows={3}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleUpdateFAQ}
                                  className="text-green-500 hover:text-green-700 flex items-center"
                                  title="Save Changes"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={cancelEditingFAQ}
                                  className="text-gray-500 hover:text-gray-700 flex items-center"
                                  title="Cancel"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                              {faq.question}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {faq.answer}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditingFAQ(faq)}
                                  className="text-blue-500 hover:text-blue-700 flex items-center"
                                  title="Edit FAQ"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFAQ(faq._id)}
                                  className="text-red-500 hover:text-red-700 flex items-center"
                                  title="Delete FAQ"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        <p className="text-gray-500 flex flex-col items-center justify-center">
                          <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
                          <span>No FAQs found. Add one to get started.</span>
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQ Viewer Tab Content */}
        {activeTab === "faq-viewer" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
                FAQ Viewer
              </h2>
              <p className="text-gray-500">How FAQs appear to users</p>
            </div>

            <div className="space-y-6">
              {isFaqLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
              ) : faqs.length > 0 ? (
                faqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      Last updated:{" "}
                      {new Date(faq.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No FAQs available. Add some in the FAQ Management tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100">
              <div className="bg-red-50 rounded-t-2xl p-6 pb-4 border-b border-red-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-red-700 flex items-center">
                    <MessageSquare className="h-6 w-6 mr-2 text-red-500" />
                    Message Details
                  </h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-2 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-800">
                      {selectedMessage.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-800 break-all">
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-gray-800">
                      {selectedMessage.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-6 w-6 text-red-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="font-medium text-gray-800 break-words">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Date Received</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-2xl p-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                {!selectedMessage.resolved && (
                  <button
                    onClick={() => {
                      handleResolveMessage(selectedMessage._id);
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
