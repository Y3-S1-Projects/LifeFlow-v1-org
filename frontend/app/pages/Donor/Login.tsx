"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import "../../styles/index.css";
import GlobalHeader from "../../components/GlobalHeader";
import Footer from "@/app/components/Footer";
import useUser from "@/app/hooks/useUser";
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/app/libs/utils";

const Login = () => {
  const router = useRouter();
  const { user, loading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState("");
  const [isDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const autofillStyles = `
  /* Light mode autofill styles */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
    -webkit-text-fill-color: rgb(17, 24, 39) !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Dark mode autofill styles */
  .dark-mode input:-webkit-autofill,
  .dark-mode input:-webkit-autofill:hover,
  .dark-mode input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px rgb(55, 65, 81) inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

  useEffect(() => {
    if (!loading && user) {
      if (user && user.role === "User") {
        router.push("/donor/dashboard");
      } else if (user && user.role === "Organizer") {
        router.push("/organizer/dashboard");
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchCsrfToken = async (): Promise<void> => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
          withCredentials: true, // Ensure cookies are sent
        });

        setCsrfToken(data.csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken; // Set globally
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = autofillStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.07, // Stagger children for better performance
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false; // Return false if email is empty
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false; // Return false if email is invalid
    } else {
      setEmailError("");
      return true; // Return true if email is valid
    }
  };

  // Real-time validation
  useEffect(() => {
    if (email) validateEmail(email);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    // Get the rememberMe value from the checkbox
    const rememberMe = (
      e.currentTarget.elements.namedItem("rememberMe") as HTMLInputElement
    )?.checked;

    try {
      const csrfTokenFromCookie = Cookies.get("x-csrf-token");

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfTokenFromCookie || csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }), // Include rememberMe in the request
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          "Invalid credentials. Please check your email and password."
        );

        if (response.status === 403 && data.requiresVerification) {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      } else {
        const redirectPath =
          sessionStorage.getItem("redirectAfterLogin") || "/donor/dashboard";
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectPath);
      }
    } catch (error) {
      setErrorMessage("Authentication failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen">
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`min-h-screen p-6 w-full md:w-3/4 lg:w-3/4  mx-auto space-y-6 flex flex-col ${
          isDarkMode ? "dark-mode" : ""
        } ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-red-50 via-white to-red-50"
        } flex flex-col justify-center py-12 sm:px-6 lg:px-8`}
      >
        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md"
          variants={itemVariants}
        >
          <motion.div
            className="flex justify-center mt-12"
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {/* <Heart
              className={`w-16 h-16 ${
                isDarkMode ? "text-red-600" : "text-red-500"
              } drop-shadow-lg`}
            /> */}
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className={`mt-6 text-center text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } drop-shadow-sm`}
          >
            Blood Donation Portal
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`mt-2 text-center text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Save lives with your contribution
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? "bg-gray-800/80" : "bg-white/80"
            } backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10`}
          >
            {errorMessage && (
              <div className="mt-2 mb-2 w-full flex justify-center">
                <p className="text-sm text-red-500 bg-red-100 border border-red-400 p-3 rounded-lg w-full max-w-md text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email input field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email address
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "email"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  } ${emailError ? "ring-2 ring-red-500" : ""}`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail
                      className={`h-5 w-5 ${
                        emailError
                          ? "text-red-500"
                          : focusedInput === "email"
                          ? "text-red-500"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput("")}
                    className={`block w-full pl-10 pr-3 py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                </motion.div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </motion.div>

              {/* Password input field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "password"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`h-5 w-5 ${
                        focusedInput === "password"
                          ? "text-red-500"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput("")}
                    className={`block w-full pl-10 pr-12 py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </motion.div>
              </motion.div>

              {/* Remember Me and Forgot Password */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <motion.input
                    whileTap={{ scale: 0.9 }}
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className={`h-4 w-4 ${
                      isDarkMode ? "text-red-600" : "text-red-600"
                    } focus:ring-red-500 border-gray-300 rounded cursor-pointer`}
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`ml-2 block text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <motion.a
                    whileHover={{ scale: 1.05, x: 5 }}
                    href="/donor/reset-password-request"
                    className={`font-medium ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    } hover:text-red-500 transition-colors duration-200`}
                  >
                    Forgot your password?
                  </motion.a>
                </div>
              </motion.div>

              {/* Sign In Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? "bg-gray-400 cursor-wait"
                      : "bg-gradient-to-r from-red-600 to-red-500"
                  } hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Registration Section */}
            <motion.div variants={containerVariants} className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className={`w-full border-t ${
                      isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`px-2 ${
                      isDarkMode
                        ? "bg-gray-800 text-gray-400"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <motion.a
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  href="/donor/register"
                  className={`w-full flex justify-center py-3 px-4 border ${
                    isDarkMode ? "border-red-600" : "border-red-500"
                  } rounded-lg shadow-sm text-sm font-medium ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  } ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } hover:bg-red-50 transition-all duration-200`}
                >
                  Register as a donor
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default Login;
