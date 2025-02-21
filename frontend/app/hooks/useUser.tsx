import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface User {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  bloodType?: string;
  isVerified: boolean;
  phoneNumber?: string;
  weight?: number;
  nicNo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  dateOfBirth?: string;
  donatedBefore?: string;
  additionalInfo?: string;
  healthConditions?: string[];
  lastDonationDate?: string;
  isEligible?: boolean;
  isProfileComplete?: boolean;
  isAssessmentCompleted?: boolean;
}
const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    `http://localhost:${process.env.PORT || 3001}`;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();

        if (!token || token === "undefined") {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
          validateStatus: (status) => status >= 200 && status < 300,
        });
        console.log(response.data);

        console.log("Raw API response:", response.data);
        console.log(
          "lastDonationDate from API:",
          response.data.lastDonationDate
        );

        // Validate response data
        if (!response.data || !response.data.email) {
          throw new Error("Invalid user data received");
        }

        setUser(response.data);
        console.log("User state after setting:", response.data);
        setError(null);
      } catch (err) {
        console.error("User fetch error:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Session expired. Please login again");
          } else if (err.response?.status === 404) {
            setError("User not found");
          } else if (err.code === "ECONNABORTED") {
            setError("Request timed out. Please try again");
          } else {
            setError(
              err.response?.data?.message || "Failed to fetch user data"
            );
          }
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};

export default useUser;
