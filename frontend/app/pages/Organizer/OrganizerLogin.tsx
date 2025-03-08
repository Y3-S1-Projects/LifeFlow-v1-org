import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Define types for the response data
interface OrganizerData {
  id: string;
  name: string;
  email: string;
  // Add other organizer properties as needed
}

interface LoginResponse {
  token: string;
  organizer: OrganizerData;
}

interface LoginFormProps {
  onLoginSuccess?: (data: LoginResponse) => void;
}

const OrganizerLogin: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${publicApi}/organizers/login`,
        formData
      );

      // Store token in localStorage or cookies
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "organizerInfo",
        JSON.stringify(response.data.organizer)
      );
      localStorage.setItem("role", "organizer"); // Store role for role-based auth

      // Check if there's a saved redirect URL
      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/organizer/dashboard";

      // Clear the stored redirect path
      localStorage.removeItem("redirectAfterLogin");

      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      } else if (mounted) {
        // Redirect to the saved path or default dashboard
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md border-t-4 border-red-600">
      <div className="flex justify-center mb-6">
        <svg
          className="w-12 h-12 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
        Blood Camp Organizer
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Sign in to manage your blood donation camps
      </p>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p className="font-bold">Login Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="your-email@example.com"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="••••••••"
            required
          />
          <div className="mt-1 text-right">
            <a
              href="/forgot-password"
              className="text-sm text-red-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Dashboard"}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Not registered yet?{" "}
            <a
              href="/organizer/register"
              className="text-red-600 font-medium hover:underline"
            >
              Register as a Blood Camp Organizer
            </a>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerLogin;
