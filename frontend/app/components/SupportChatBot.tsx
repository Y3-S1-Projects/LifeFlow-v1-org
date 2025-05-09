import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import faqData from "../data/chatbotdata.json";

interface Message {
  text: string;
  sender: "user" | "bot";
  isFAQ?: boolean;
}

const SupportChatBot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  );
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        text: "Hello! I'm here to answer your questions about blood donation and help you find donation camps. Ask me anything!",
        sender: "bot",
      },
    ]);
  }, []);

  // Scroll to bottom of messages and focus input when chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const generateResponse = async (prompt: string) => {
    try {
      setIsLoading(true);

      // First check if it's a simple FAQ
      const lowerInput = prompt.toLowerCase();
      const matchedFAQ = faqData.faqs.find(
        (faq) =>
          faq.question.toLowerCase().includes(lowerInput) ||
          lowerInput.includes(faq.question.toLowerCase())
      );

      if (matchedFAQ) {
        return { text: matchedFAQ.answer, isFAQ: true };
      }

      // If not in FAQ, use Gemini
      const promptConfig = [
        `You are a helpful assistant for a blood donation camp finder website. 
        Answer the following question concisely and accurately about blood donation: 
        "${prompt}". 
        
        If the question is about finding donation camps, remind them to use the camp finder tool on our website.
        Keep responses under 3 sentences when possible.`,
      ];

      const result = await model.generateContent(promptConfig);
      const response = await result.response;
      return { text: response.text(), isFAQ: false };
    } catch (error) {
      console.error("Error generating response:", error);
      return {
        text: "I'm having trouble answering that. Please try asking a different question about blood donation.",
        isFAQ: false,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Generate and add bot response
    const { text, isFAQ } = await generateResponse(input);
    setMessages((prev) => [...prev, { text, sender: "bot", isFAQ }]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Sample questions for quick selection
  const quickQuestions = [
    "Who can donate blood?",
    "How often can I donate?",
    "Find donation camps near me",
    "What are the health benefits?",
    "Is blood donation safe?",
    "What should I do before donating?",
  ];

  const selectQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 h-[32rem] flex flex-col border border-red-100 transition-all duration-300 overflow-hidden">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Blood Donation Assistant</h3>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white rounded-br-none"
                      : msg.isFAQ
                      ? "bg-white border-l-4 border-red-500 text-gray-800 rounded-bl-none shadow-md"
                      : "bg-white text-gray-800 rounded-bl-none shadow-md"
                  }`}
                >
                  {msg.text}
                  {/* Little triangle for speech bubble effect */}
                  <div
                    className={`absolute w-3 h-3 -bottom-1 ${
                      msg.sender === "user"
                        ? "right-0 bg-red-600 transform -translate-x-1/2 rotate-45"
                        : "left-0 bg-white transform translate-x-1/2 rotate-45"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="relative max-w-[85%] rounded-2xl p-4 bg-white shadow-md rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-bounce delay-100"></div>
                    <div className="w-3 h-3 rounded-full bg-red-400 animate-bounce delay-200"></div>
                  </div>
                  <div className="absolute w-3 h-3 -bottom-1 left-0 bg-white transform translate-x-1/2 rotate-45"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions section */}
          {messages.length < 3 && (
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-t border-red-100">
              <p className="text-xs font-medium text-red-700 mb-2">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectQuickQuestion(question)}
                    className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-red-100 bg-white"
          >
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 p-3 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                disabled={isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 rounded-full shadow-xl hover:shadow-2xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative"
          aria-label="Open chat"
        >
          <div className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md animate-pulse">
            <span>1</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SupportChatBot;
