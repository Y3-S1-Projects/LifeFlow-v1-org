import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface UserData {
  _id: string;
  // User fields
  fullName?: string;
  firstName?: string;
  lastName?: string;
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
    type?: string;
    coordinates?: [number, number];
  };
  dateOfBirth?: string;
  donatedBefore?: string;
  additionalInfo?: string;
  isEligibleToDonate?: boolean;
  healthConditions?: string[];
  lastDonationDate?: string;
  isEligible?: boolean;
  isProfileComplete?: boolean;
  isAssessmentCompleted?: boolean;
  emergencyContact?: {
    fullName?: string;
    relationship?: string;
    phone?: string;
  };
  // Organizer fields
  name?: string;
  phone?: string;
  eligibleToOrganize?: boolean;
  organization?: string;

  // Common fields
  role: string;
}

interface UseUserReturn {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  refetch: () => Promise<void>;
  debug: {
    token: string | null;
    apiUrl: string;
    lastResponse: any;
  };
}

const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState({
    token: null as string | null,
    apiUrl: "",
    lastResponse: null as any,
  });

  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Store token for debugging (you might want to mask this in production)
      setDebugInfo((prev) => ({
        ...prev,
        token,
        apiUrl: `${publicApi}/api/me`,
      }));

      // If no token is present, we're dealing with a guest user
      // Set user to null and exit early without making the API call
      if (!token || token === "undefined") {
        setUser(null);
        setError(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Only proceed with API call if we have a valid token
      const response = await axios.get(`${publicApi}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
        validateStatus: (status) => {
          return status >= 200 && status < 300;
        },
      });
      setDebugInfo((prev) => ({ ...prev, lastResponse: response.data }));

      // Validate response data
      if (!response.data || !response.data.email) {
        throw new Error("Invalid user data received");
      }

      setUser(response.data);
      setError(null);
    } catch (err) {
      // Only log errors for token-related issues if we actually have a token
      // This prevents logging 401 errors for guest users
      const token = getToken();
      if (token && token !== "undefined") {
        console.error("User fetch error:", err);

        if (axios.isAxiosError(err)) {
          // Log the full error for debugging
          console.error("Axios error details:", {
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers,
            config: err.config,
          });

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
      } else {
        // For guest users (no token), we just set user to null without an error
        setUser(null);
        setError(null);
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        await fetchUser();
      } catch (err) {
        if (isMounted) {
          console.error("Error in initial fetch:", err);
        }
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Return a refetch function to allow manual refresh
  const refetch = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    isInitialized,
    refetch,
    debug: debugInfo,
  };
};

export default useUser;
