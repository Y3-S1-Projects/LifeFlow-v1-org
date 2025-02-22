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
    coordinates: [number, number];
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

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const API_URL =
    process.env.REACT_APP_API_URL ||
    `http://localhost:${process.env.PORT || 3001}`;

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const token = getToken();

        if (!token || token === "undefined") {
          throw new Error("Authentication required");
        }

        const response = await axios.get(`${API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
          validateStatus: (status) => status >= 200 && status < 300,
        });

        if (!isMounted) return;

        // Validate response data
        if (!response.data || !response.data.email) {
          throw new Error("Invalid user data received");
        }

        setUser(response.data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;

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
          setError(
            err instanceof Error ? err.message : "An unexpected error occurred"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error, isInitialized };
};

export default useUser;
