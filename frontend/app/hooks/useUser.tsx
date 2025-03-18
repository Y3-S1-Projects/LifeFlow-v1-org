import { useState, useEffect } from "react";
import axios from "axios";
import { isAuthenticated } from "../utils/auth";

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
  nextEligibleDonationDate?: Date;
  isProfileComplete?: boolean;
  isAssessmentCompleted?: boolean;
  emergencyContact?: {
    fullName?: string;
    relationship?: string;
    phoneNumber?: string;
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
}

const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);

  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const checkAuthentication = async () => {
    const authStatus = await isAuthenticated();
    setIsUserAuthenticated(authStatus);
    return authStatus;
  };

  const fetchUser = async () => {
    try {
      setLoading(true);

      // Check authentication first
      const authenticated = await checkAuthentication();
      if (!authenticated) {
        setUser(null);
        setError(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      const response = await axios.get(`${publicApi}/api/me`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 5000,
        validateStatus: (status) => {
          return (status >= 200 && status < 300) || status === 401;
        },
      });

      if (response.status === 401) {
        setUser(null);
        setError(null);
        return;
      }

      if (!response.data || !response.data.email) {
        throw new Error("Invalid user data received");
      }

      setUser(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          setError("Request timed out. Please try again");
        } else {
          setError(err.response?.data?.message || "Failed to fetch user data");
        }
      } else {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      }

      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      await fetchUser();
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const refetch = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    isInitialized,
    refetch,
  };
};

export default useUser;
