"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import "../../styles/index.css";
import GlobalHeader from "../../components/GlobalHeader";
import Footer from "@/app/components/Footer";
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/app/libs/utils";

interface PasswordCriteriaProps {
  met: boolean;
  text: string;
  isDarkMode: boolean;
}

const PasswordCriteria: React.FC<PasswordCriteriaProps> = ({
  met,
  text,
  isDarkMode,
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-2 h-2 rounded-full ${met ? "bg-green-500" : "bg-red-500"}`}
    />
    <span
      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
    >
      {text}
    </span>
  </div>
);

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState("");
  const [isDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Password validation state
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
    special: false,
  });

  // Get token from URL
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const autofillStyles = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
      -webkit-text-fill-color: rgb(17, 24, 39) !important;
      transition: background-color 5000s ease-in-out 0s;
    }

    .dark-mode input:-webkit-autofill,
    .dark-mode input:-webkit-autofill:hover,
    .dark-mode input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 30px rgb(55, 65, 81) inset !important;
      -webkit-text-fill-color: white !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  `;

  useEffect(() => {
    if (!token || !email) {
      setErrorMessage(
        "Invalid reset link. Please request a new password reset."
      );
    }
  }, [token, email]);

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
        staggerChildren: 0.07,
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

  const validatePassword = (password: string) => {
    const errors = {
      length: password.length >= 8 && password.length <= 12,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordErrors(errors);

    // Check if all criteria are met
    const isValid = Object.values(errors).every(Boolean);
    if (!isValid) {
      setPasswordError("Password does not meet all requirements");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  useEffect(() => {
    if (password) validatePassword(password);
    if (confirmPassword) validateConfirmPassword(confirmPassword);
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !validatePassword(password) ||
      !validateConfirmPassword(confirmPassword)
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const csrfTokenFromCookie = Cookies.get("x-csrf-token");

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfTokenFromCookie || csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || "Failed to reset password. Please try again."
        );
      } else {
        setSuccessMessage(
          "Password reset successfully! Redirecting to login..."
        );
        toast.success("Password reset successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/donor/login");
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="w-screen">
        <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`min-h-screen p-6 w-full md:w-3/4 lg:w-3/4 mx-auto space-y-6 flex flex-col ${
            isDarkMode ? "dark-mode" : ""
          } ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
              : "bg-gradient-to-br from-red-50 via-white to-red-50"
          } flex flex-col justify-center py-12 sm:px-6 lg:px-8`}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500">
              Invalid Reset Link
            </h2>
            <p className="mt-4 text-gray-600">
              The password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
            <a
              href="/forgot-password"
              className="mt-6 inline-block text-red-600 hover:text-red-700"
            >
              Request New Reset Link
            </a>
          </div>
        </motion.div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className="w-screen">
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`min-h-screen p-6 w-full md:w-3/4 lg:w-3/4 mx-auto space-y-6 flex flex-col ${
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
          <motion.h2
            variants={itemVariants}
            className={`mt-6 text-center text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } drop-shadow-sm`}
          >
            Set New Password
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`mt-2 text-center text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Create a new password for your account
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

            {successMessage && (
              <div className="mt-2 mb-2 w-full flex justify-center">
                <p className="text-sm text-green-500 bg-green-100 border border-green-400 p-3 rounded-lg w-full max-w-md text-center flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {successMessage}
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Password input field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  New Password
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "password"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  } ${passwordError ? "ring-2 ring-red-500" : ""}`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`h-5 w-5 ${
                        passwordError
                          ? "text-red-500"
                          : focusedInput === "password"
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
                    placeholder="Enter your new password"
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
                {passwordError && (
                  <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                )}

                {/* Password criteria */}
                {(focusedInput === "password" || password) && (
                  <div className="mt-2 space-y-2">
                    <PasswordCriteria
                      met={passwordErrors.length}
                      text="8-12 characters long"
                      isDarkMode={isDarkMode}
                    />
                    <PasswordCriteria
                      met={passwordErrors.number}
                      text="Contains a number"
                      isDarkMode={isDarkMode}
                    />
                    <PasswordCriteria
                      met={passwordErrors.uppercase}
                      text="Contains an uppercase letter"
                      isDarkMode={isDarkMode}
                    />
                    <PasswordCriteria
                      met={passwordErrors.lowercase}
                      text="Contains a lowercase letter"
                      isDarkMode={isDarkMode}
                    />
                    <PasswordCriteria
                      met={passwordErrors.special}
                      text="Contains a special character"
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}
              </motion.div>

              {/* Confirm Password input field */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm New Password
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "confirmPassword"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  } ${confirmPasswordError ? "ring-2 ring-red-500" : ""}`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      className={`h-5 w-5 ${
                        confirmPasswordError
                          ? "text-red-500"
                          : focusedInput === "confirmPassword"
                          ? "text-red-500"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedInput("confirmPassword")}
                    onBlur={() => setFocusedInput("")}
                    className={`block w-full pl-10 pr-12 py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none transition-all duration-200`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </motion.div>
                {confirmPasswordError && (
                  <p className="mt-1 text-sm text-red-500">
                    {confirmPasswordError}
                  </p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || !!successMessage}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading || successMessage
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-500"
                  } hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Resetting...
                    </div>
                  ) : successMessage ? (
                    "Success!"
                  ) : (
                    "Reset Password"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default ResetPassword;
