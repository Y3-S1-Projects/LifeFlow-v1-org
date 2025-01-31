"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Heart,
  User,
  Droplet,
  Phone,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const DonerRegistration = () => {
  const router = useRouter();
  // const [fname, setFname] = useState("");
  // const [lname, setLname] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [contact, setContact] = useState("");
  const [focusedInput, setFocusedInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
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

  // Define interface for password errors
  interface PasswordErrors {
    length: boolean;
    number: boolean;
    uppercase: boolean;
    lowercase: boolean;
    special: boolean;
  }

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

    try {
      const response = await fetch("http://localhost:3001/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    if (name === "phoneNumber" && !/^\d*$/.test(value)) return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`h-screen w-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-red-50 via-white to-red-50"
      } flex flex-col justify-center py-12 sm:px-6 lg:px-8`}
    >
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-gray-100 transition-colors duration-200"
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
        className="sm:mx-auto sm:w-full sm:max-w-md"
        variants={itemVariants}
      >
        <motion.div
          className="flex justify-center"
          whileHover={{ scale: 1.1, rotate: 360 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <Heart
            className={`w-16 h-16 ${
              isDarkMode ? "text-red-600" : "text-red-500"
            } drop-shadow-lg`}
          />
        </motion.div>
        <motion.h2
          variants={itemVariants}
          className={`mt-6 text-center text-4xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          } drop-shadow-sm`}
        >
          Donor Registration
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className={`mt-2 text-center text-lg ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Become a life saver today
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
                  className={`block w-full pl-10 pr-3 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                  placeholder="Enter your First name"
                  required
                />
              </motion.div>
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
                  className={`block w-full pl-10 pr-3 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                  placeholder="Enter your Last name"
                  required
                />
              </motion.div>
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
                  className={`block w-full pl-10 pr-3 py-3 ${
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
                    handleChange(e); // Properly invoke handleChange
                    validatePassword(e.target.value); // Validate the password
                  }}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput("")}
                  className={`block w-full pl-10 pr-12 py-3 ${
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
                  pattern="[0-9]*"
                  inputMode="numeric"
                  onFocus={() => setFocusedInput("contact")}
                  onBlur={() => setFocusedInput("")}
                  className={`block w-full pl-10 pr-3 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200`}
                  placeholder="Enter contact number"
                  required
                />
              </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${
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
                href="/login"
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
  );
};

export default DonerRegistration;
