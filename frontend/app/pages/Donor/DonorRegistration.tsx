"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../../components/Footer";
import GlobalHeader from "../../components/GlobalHeader";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "@/app/libs/utils";

const DonorRegistration = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameErrors, setNameErrors] = useState({
    firstName: "",
    lastName: "",
  });
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
    special: false,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  interface PasswordCriteriaProps {
    met: boolean;
    text: string;
  }

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

  // Password validation
  const validatePassword = (password: string) => {
    setPasswordErrors({
      length: password.length >= 8 && password.length <= 12,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };
  const validatePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return false;
    }

    // Sri Lankan phone number regex patterns:
    // Mobile: 0[7][0-9]{8} or +94[7][0-9]{8}
    // Landline: 0[1-9][0-9]{7} or +94[1-9][0-9]{7}
    const pattern = /^(?:\+94|0)(7\d{8}|[1-9]\d{7})$/;

    if (!pattern.test(phoneNumber)) {
      setPhoneError("Please enter a valid Sri Lankan phone number");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const validateName = (name: string, field: "firstName" | "lastName") => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s'-]+$/;

    if (!name.trim()) {
      setNameErrors((prev) => ({
        ...prev,
        [field]: `${field === "firstName" ? "First" : "Last"} name is required`,
      }));
      return false;
    } else if (!nameRegex.test(name)) {
      setNameErrors((prev) => ({
        ...prev,
        [field]: `Only letters and spaces allowed`,
      }));
      return false;
    } else if (name.length < 2) {
      setNameErrors((prev) => ({
        ...prev,
        [field]: `Must be at least 2 characters`,
      }));
      return false;
    } else if (name.length > 50) {
      setNameErrors((prev) => ({
        ...prev,
        [field]: `Must be less than 50 characters`,
      }));
      return false;
    } else {
      setNameErrors((prev) => ({ ...prev, [field]: "" }));
      return true;
    }
  };

  useEffect(() => {
    if (formData.phoneNumber) validatePhoneNumber(formData.phoneNumber);
  }, [formData.phoneNumber]);

  useEffect(() => {
    if (formData.email) validateEmail(formData.email);
  }, [formData.email]);

  useEffect(() => {
    if (formData.password) validatePassword(formData.password);
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    const isFirstNameValid = validateName(formData.firstName, "firstName");
    const isLastNameValid = validateName(formData.lastName, "lastName");
    validateEmail(formData.email);
    const isPhoneValid = validatePhoneNumber(formData.phoneNumber);

    if (!isFirstNameValid || !isLastNameValid || emailError || !isPhoneValid) {
      return;
    }

    if (emailError || !isPhoneValid) {
      return;
    }

    try {
      // Get CSRF token from axios defaults
      const Tokendata = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
        withCredentials: true,
      });
      setCsrfToken(Tokendata.data.csrfToken);

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": Tokendata.data.csrfToken,
        },
        credentials: "include", // Important: include cookies with the request
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Redirect to OTP verification page
      router.push(`/verify-email?email=${formData.email}`);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Prevent non-letter characters for name fields
    if (
      (name === "firstName" || name === "lastName") &&
      !/^[a-zA-Z\s'-]*$/.test(value)
    ) {
      return;
    }

    // Special handling for phone number field
    if (name === "phoneNumber") {
      // Only allow numbers and + character
      const cleanedValue = value.replace(/[^0-9+]/g, "");

      // Ensure only one + at the start
      const hasPlus = cleanedValue.includes("+");
      const finalValue = hasPlus
        ? "+" + cleanedValue.replace(/[^0-9]/g, "")
        : cleanedValue;

      // Limit length based on whether it starts with +94 or 0
      const maxLength = finalValue.startsWith("+94")
        ? 12
        : finalValue.startsWith("0")
        ? 10
        : 15;
      if (finalValue.length > maxLength) return;

      setFormData((prev) => ({
        ...prev,
        [name]: finalValue, // Use finalValue instead of value
      }));

      validatePhoneNumber(finalValue);
      return; // Return early since we handled phone number case
    }

    // For all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate fields
    if (name === "firstName") validateName(value, "firstName");
    if (name === "lastName") validateName(value, "lastName");
    if (name === "email") validateEmail(value);

    if (apiError) setApiError("");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const PasswordCriteria: React.FC<PasswordCriteriaProps> = ({ met, text }) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          met ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span
        className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div className="w-full ">
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`min-h-screen p-6 w-full md:w-3/4 lg:w-3/4  mx-auto space-y-6 flex flex-col ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-red-50 via-white to-red-50"
        }  py-12 sm:px-6 lg:px-8 pt-16 pb-16 `} // Adjusted padding for mobile
      >
        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          className="fixed bottom-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-gray-100 transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 text-yellow-500" />
          ) : (
            <Moon className="h-6 w-6 text-gray-800" />
          )}
        </motion.button>

        <motion.div
          className="mx-auto w-full max-w-md" // Adjusted for mobile
          variants={itemVariants}
        >
          <motion.div
            className="flex justify-center"
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
            className={`mt-6 text-center text-3xl sm:text-4xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } drop-shadow-sm`} // Responsive font size
          >
            Donor Registration
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className={`mt-2 text-center text-base sm:text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`} // Responsive font size
          >
            Become a life saver today
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="mt-8 mx-auto w-full max-w-md" // Adjusted for mobile
        >
          <motion.div
            variants={itemVariants}
            className={`${
              isDarkMode ? "bg-gray-800/80" : "bg-white/80"
            } backdrop-blur-sm py-8 px-4 shadow-2xl rounded-2xl sm:px-10`} // Adjusted padding for mobile
          >
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600"
              >
                {apiError}
              </motion.div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* First Name */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="fname"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  First Name
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "fname"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 " />
                  </div>
                  <input
                    id="fname"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("fname")}
                    onBlur={() => setFocusedInput("")}
                    pattern="[a-zA-Z\s'-]+"
                    className={`block w-full pl-10 pr-3 py-2 sm:py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Enter your First name"
                    required
                  />
                </motion.div>
                {nameErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {nameErrors.firstName}
                  </p>
                )}
              </motion.div>

              {/* Last Name */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="lname"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Last Name
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "lname"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 " />
                  </div>
                  <input
                    id="lname"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("lname")}
                    onBlur={() => setFocusedInput("")}
                    pattern="[a-zA-Z\s'-]+"
                    className={`block w-full pl-10 pr-3 py-2 sm:py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Enter your Last name"
                    required
                  />
                </motion.div>
                {nameErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {nameErrors.lastName}
                  </p>
                )}
              </motion.div>

              {/* Email */}
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
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput("")}
                    className={`block w-full pl-10 pr-3 py-2 sm:py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Enter your email"
                    required
                  />
                </motion.div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </motion.div>

              {/* Password */}
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
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => {
                      handleChange(e);
                      validatePassword(e.target.value);
                    }}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput("")}
                    className={`block w-full pl-10 pr-12 py-2 sm:py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </motion.div>

                {/* Password validation criteria */}
                {(focusedInput === "password" || formData.password) && (
                  <div className="mt-2 space-y-2">
                    <PasswordCriteria
                      met={passwordErrors.length}
                      text="8-12 characters long"
                    />
                    <PasswordCriteria
                      met={passwordErrors.number}
                      text="Contains a number"
                    />
                    <PasswordCriteria
                      met={passwordErrors.uppercase}
                      text="Contains an uppercase letter"
                    />
                    <PasswordCriteria
                      met={passwordErrors.lowercase}
                      text="Contains a lowercase letter"
                    />
                    <PasswordCriteria
                      met={passwordErrors.special}
                      text="Contains a special character"
                    />
                  </div>
                )}
              </motion.div>

              {/* Contact Number */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="contact"
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Contact Number
                </label>
                <motion.div
                  className={`mt-1 relative rounded-lg shadow-sm overflow-hidden ${
                    focusedInput === "contact"
                      ? "ring-2 ring-red-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="contact"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      // Prevent non-numeric characters except +, Backspace, Delete, Tab, etc.
                      if (
                        !/[0-9+]/.test(e.key) &&
                        ![
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onFocus={() => setFocusedInput("contact")}
                    onBlur={() => {
                      setFocusedInput("");
                      validatePhoneNumber(formData.phoneNumber);
                    }}
                    className={`block w-full pl-10 pr-3 py-2 sm:py-3 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                    placeholder="e.g., 0712345678 or +94712345678"
                    required
                  />
                </motion.div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 sm:py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${
                    isDarkMode
                      ? "bg-gradient-to-r from-red-700 to-red-600"
                      : "bg-gradient-to-r from-red-600 to-red-500"
                  } hover:from-red-700 hover:to-red-600 transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Registering...
                    </div>
                  ) : (
                    "Register Now"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Login Prompt */}
            <motion.div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Already have an account?{" "}
                <motion.a
                  href="/donor/login"
                  className={`font-medium ${
                    isDarkMode ? "text-red-400" : "text-red-600"
                  } hover:text-red-500 transition-colors duration-200`}
                  whileHover={{ scale: 1.05 }}
                >
                  Sign in here
                </motion.a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default DonorRegistration;
