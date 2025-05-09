import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showNotification, setShowNotification] = useState(true);
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

  // Hide notification after 5 seconds
  useEffect(() => {
    if (!isOpen && showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showNotification]);

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
    if (!isOpen) {
      setShowNotification(false);
    }
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
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 h-[32rem] flex flex-col border border-gray-200 overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="p-2 bg-white/20 rounded-full flex items-center justify-center"
                ></motion.div>
                <div>
                  <h3 className="font-bold text-lg">Blood Buddy</h3>{" "}
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
                aria-label="Close chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className={`mb-4 flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl p-4 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-br-none shadow-md"
                          : msg.isFAQ
                          ? "bg-white text-gray-800 rounded-bl-none shadow-md border-l-4 border-red-400"
                          : "bg-white text-gray-800 rounded-bl-none shadow-md"
                      }`}
                    >
                      {msg.text}
                      {/* Little triangle for speech bubble effect */}
                      <div
                        className={`absolute w-3 h-3 -bottom-1.5 ${
                          msg.sender === "user"
                            ? "right-0 bg-red-600 transform -translate-x-1/2 rotate-45"
                            : "left-0 bg-white transform translate-x-1/2 rotate-45"
                        }`}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start mb-4"
                >
                  <div className="relative max-w-[85%] rounded-2xl p-4 bg-white shadow-md rounded-bl-none">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: 0,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-red-400"
                      ></motion.div>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: 0.2,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-red-400"
                      ></motion.div>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7,
                          delay: 0.4,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-red-400"
                      ></motion.div>
                    </div>
                    <div className="absolute w-3 h-3 -bottom-1.5 left-0 bg-white transform translate-x-1/2 rotate-45"></div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions section */}
            {messages.length < 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="px-4 py-3 bg-white border-t border-gray-100"
              >
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => selectQuickQuestion(question)}
                      className="text-xs bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-gray-100 bg-white"
            >
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent shadow-sm bg-gray-50"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 transition-all shadow-md"
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
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="flex flex-col items-end space-y-3">
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: 3, duration: 1.5, delay: 0.5 }}
                    className="bg-white rounded-lg shadow-lg px-4 py-2.5 text-sm text-gray-700 border-l-4 border-red-500 max-w-xs"
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span className="font-medium">
                        Need help with blood donation?
                      </span>
                      <button
                        onClick={() => setShowNotification(false)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-0 right-4 w-3 h-3 bg-white transform rotate-45 -mb-1.5 border-r border-b border-gray-200"></div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleChat}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
              aria-label="Open chat"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: 5,
                  duration: 0.5,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
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
              </motion.div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportChatBot;
