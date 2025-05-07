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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { SupportTab } from "./components/SupportTab";
import { usePDF } from "react-to-pdf";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  resolved: boolean;
  region?: string; // Optional region property
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

  // PDF export ref and hook
  const reportRef = useRef(null);
  const { toPDF, targetRef } = usePDF({
    filename: `support_report_${new Date().toISOString().split('T')[0]}.pdf`,
  });

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
  });

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

  // Chart data
  const caseData = prepareCasesByRegionData();
  const weeklyCaseData = prepareWeeklyCaseData();

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#A28DFF"];

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

        {/* FAQ Management Tab Content */}
        {activeTab === "faq-management" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-purple-500" />
                FAQ Management
              </h2>
              <button
                onClick={fetchFAQs}
                className="mt-4 md:mt-0 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                Refresh FAQs
              </button>
            </div>

            {/* Create FAQ Form */}
            <div className="bg-purple-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-purple-800 mb-4">
                Create New FAQ
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter question here..."
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter answer here..."
                  ></textarea>
                </div>
                <button
                  onClick={handleCreateFAQ}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create FAQ
                </button>
              </div>
            </div>

            {/* FAQ List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
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
                  {faqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm"
                    >
                      {editingFAQ && editingFAQ._id === faq._id ? (
                        <div className="space-y-4">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            ></textarea>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleUpdateFAQ}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditingFAQ}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">
                              {faq.question}
                            </h4>
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
                          </div>
                          <p className="text-gray-600 mt-2">{faq.answer}</p>
                          <div className="mt-4 text-xs text-gray-400">
                            <p>
                              Created:{" "}
                              {new Date(faq.createdAt).toLocaleString()}
                            </p>
                            <p>
                              Last Updated:{" "}
                              {new Date(faq.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 flex flex-col items-center justify-center">
                    <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
                    <span>No FAQs found. Create your first FAQ above.</span>
                  </p>
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

            {/* FAQ Accordion */}
            {isFaqLoading ? (
              <div className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">Loading FAQs...</p>
              </div>
            ) : faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs
                  .filter((faq) =>
                    faq.question
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((faq, index) => (
                    <div
                      key={faq._id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <details className="group">
                        <summary className="flex justify-between items-center cursor-pointer p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium text-gray-800">
                            {faq.question}
                          </h3>
                          <span className="text-blue-500 group-open:rotate-180 transition-transform">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </summary>
                        <div className="p-6 bg-white">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      </details>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 flex flex-col items-center justify-center">
                  <HelpCircle className="h-10 w-10 text-gray-300 mb-2" />
                  <span>No FAQs available at this time.</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
