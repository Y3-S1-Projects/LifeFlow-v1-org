import {
  Calendar,
  CheckCircle,
  Eye,
  Mail,
  MessageSquare,
  Search,
  User,
  X,
} from "lucide-react";
import react, { useEffect, useState } from "react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

export const SupportTab = () => {
  const [showResolved, setShowResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]);
  const [activeMessages, setActiveMessages] = useState<ContactMessage[]>([]);
  const [resolvedMessages, setResolvedMessages] = useState<ContactMessage[]>(
    []
  );
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

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

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const resolved = allMessages.filter((msg) => msg.resolved);
    const active = allMessages.filter((msg) => !msg.resolved);

    setResolvedMessages(resolved);
    setActiveMessages(active);
    setFilteredMessages(showResolved ? resolved : active);
  }, [allMessages, showResolved]);

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

  return (
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
            <col className="w-[15%]" />
            {/* Name */}
            <col className="w-[20%]" />
            {/* Email */}
            <col className="w-[15%]" />
            {/* Subject */}
            <col className="w-[40%]" />
            {/* Message */}
            <col className="w-[10%]" />
            {/* Actions */}
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
                    index === filteredMessages.length - 1 ? "rounded-b-lg" : ""
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
  );
};
