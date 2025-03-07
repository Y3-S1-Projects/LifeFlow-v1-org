import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Droplet,
  Calendar,
  Map,
  Phone,
  ChevronDown,
  MinusCircle,
} from "lucide-react";
import { getUserIdFromToken } from "../utils/auth";

interface EligibilityStatus {
  isEligible: boolean;
  isEligibleToDonate: boolean;
  nextEligibleDate: Date | null;
  daysUntilEligible: number;
}

interface UserDetails {
  name: string;
  bloodType: string;
  eligibilityStatus: EligibilityStatus;
  totalPintsDonated: number;
  lastPintsDonated: number;
}

interface CampContact {
  phone: string;
  email: string;
}

interface Camp {
  id: string;
  name: string;
  address: string;
  availableDates: Date[];
  operatingHours: string;
  contact: CampContact;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  userDetails?: UserDetails;
  nearbyCamps?: Camp[];
}

export default function BloodDonationChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello I'm BloodBuddy! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [nearbyCamps, setNearbyCamps] = useState<Camp[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Autoscroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Animation effect when opening the chat
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 500);
    }
  }, [isOpen]);

  // Close info panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setShowInfoPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get user ID from your auth context/storage
      const userId = getUserIdFromToken();

      // Call Gemini API with context about blood donation
      const response = await fetch(`${publicApi}/chatbot/gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // If using auth tokens
        },
        body: JSON.stringify({
          message: input,
          history: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
          userId: userId, // Pass the user ID here
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Create a bot message that includes the response
      const botMessage: Message = {
        id: Date.now().toString() + "-bot",
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
        userDetails: data.userDetails,
        nearbyCamps: data.nearbyCamps,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Update state with the returned data
      if (data.userDetails) {
        setUserDetails(data.userDetails);
      }

      if (data.nearbyCamps && data.nearbyCamps.length > 0) {
        setNearbyCamps(data.nearbyCamps);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        content:
          "I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEligibilityStatus = () => {
    if (!userDetails?.eligibilityStatus) return null;

    const { eligibilityStatus } = userDetails;

    if (!eligibilityStatus.isEligible) {
      return {
        status: "Not Eligible",
        message:
          "Your profile information is incomplete or you don't meet the eligibility criteria.",
        color: "bg-red-100 text-red-800",
        icon: <X className="text-red-800" size={18} />,
      };
    }

    if (eligibilityStatus.isEligibleToDonate) {
      return {
        status: "Ready to Donate",
        message: "You're eligible to donate blood now!",
        color: "bg-green-100 text-green-800",
        icon: (
          <Droplet className="text-green-800" size={18} fill="currentColor" />
        ),
      };
    }

    if (eligibilityStatus.nextEligibleDate) {
      return {
        status: "Waiting Period",
        message: `${
          eligibilityStatus.daysUntilEligible
        } days remaining until you can donate (${formatDate(
          eligibilityStatus.nextEligibleDate
        )})`,
        color: "bg-yellow-100 text-yellow-800",
        icon: <Calendar className="text-yellow-800" size={18} />,
      };
    }

    return {
      status: "Unknown",
      message: "We couldn't determine your eligibility status.",
      color: "bg-gray-100 text-gray-800",
      icon: <X className="text-gray-800" size={18} />,
    };
  };

  const eligibilityInfo = getEligibilityStatus();

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div
          ref={chatRef}
          className={`flex flex-col w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden
            ${showAnimation ? "animate-fadeIn" : ""}`}
          style={{ height: isMinimized ? "60px" : "460px" }}
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 flex justify-between items-center shadow-md">
            <h3 className="font-bold flex items-center text-sm">
              <Droplet size={18} className="mr-2" fill="white" stroke="white" />
              Blood Buddy
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className="text-white hover:bg-red-700/50 rounded-full p-1 transition-colors"
                title="Show donation info"
              >
                <Droplet size={16} fill={showInfoPanel ? "white" : "none"} />
              </button>
              <button
                onClick={toggleMinimize}
                className="text-white hover:bg-red-700/50 rounded-full p-1 transition-colors"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? (
                  <ChevronDown size={16} />
                ) : (
                  <MinusCircle size={16} />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-700/50 rounded-full p-1 transition-colors"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-grow flex overflow-hidden">
                <div
                  className={`flex-1 overflow-hidden bg-gray-50 ${
                    showInfoPanel ? "w-1/2" : "w-full"
                  }`}
                >
                  <div
                    ref={messagesContainerRef}
                    className="p-3 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 ${
                          message.sender === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block px-3 py-2 rounded-lg max-w-[85%] animate-messageIn ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm"
                              : "bg-white text-gray-800 border shadow-sm"
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="text-center py-2">
                        <div className="flex justify-center space-x-1">
                          <div className="animate-bounce bg-red-600 rounded-full h-2 w-2 delay-100"></div>
                          <div className="animate-bounce bg-red-600 rounded-full h-2 w-2 delay-200"></div>
                          <div className="animate-bounce bg-red-600 rounded-full h-2 w-2 delay-300"></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {showInfoPanel && userDetails && (
                  <div className="border-l w-1/2 bg-gray-50 overflow-y-auto animate-slideIn">
                    <div className="p-3">
                      <h3 className="font-bold text-red-600 text-sm mb-2 border-b pb-1">
                        Your Donation Profile
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium">{userDetails.name}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Blood Type</p>
                          <p className="font-medium flex items-center">
                            <span className="inline-block bg-red-100 text-red-800 font-bold px-2 py-1 rounded text-xs mr-2">
                              {userDetails.bloodType || "Unknown"}
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Donation Statistics</p>
                          <div className="flex gap-2">
                            <div className="bg-red-50 rounded p-2 text-center flex-1">
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="font-bold text-red-600">
                                {userDetails.totalPintsDonated}
                              </p>
                            </div>
                            <div className="bg-red-50 rounded p-2 text-center flex-1">
                              <p className="text-xs text-gray-500">Last</p>
                              <p className="font-bold text-red-600">
                                {userDetails.lastPintsDonated}
                              </p>
                            </div>
                          </div>
                        </div>

                        {eligibilityInfo && (
                          <div>
                            <p className="text-gray-500">Eligibility Status</p>
                            <div
                              className={`rounded p-2 mt-1 ${eligibilityInfo.color}`}
                            >
                              <div className="flex items-center">
                                {eligibilityInfo.icon}
                                <span className="font-medium ml-1">
                                  {eligibilityInfo.status}
                                </span>
                              </div>
                              <p className="text-xs mt-1">
                                {eligibilityInfo.message}
                              </p>
                            </div>
                          </div>
                        )}

                        {nearbyCamps.length > 0 && (
                          <div>
                            <h4 className="font-bold text-red-600 text-sm mt-4 mb-2 border-b pb-1">
                              Nearby Donation Centers
                            </h4>
                            <div className="space-y-2 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                              {nearbyCamps.slice(0, 2).map((camp) => (
                                <div
                                  key={camp.id}
                                  className="bg-white p-2 rounded border text-xs"
                                >
                                  <div className="font-medium text-red-600">
                                    {camp.name}
                                  </div>
                                  <div className="flex items-center text-gray-500 mt-1">
                                    <Map size={12} className="mr-1" />{" "}
                                    {camp.address}
                                  </div>
                                  <div className="flex items-center text-gray-500 mt-1">
                                    <Phone size={12} className="mr-1" />{" "}
                                    {camp.contact.phone}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t p-2 flex bg-white shadow-inner"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about blood donation..."
                  className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-r-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-full shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all transform hover:scale-110 pulse-animation flex items-center justify-center"
            aria-label="Open chat"
          >
            <div className="relative">
              <MessageCircle size={24} />
              <Droplet
                size={12}
                className="absolute -top-1 -right-1 text-white"
                fill="white"
                stroke="white"
              />
            </div>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-animation {
          animation: pulseRing 2s ease-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-messageIn {
          animation: messageIn 0.2s ease-out;
        }

        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
