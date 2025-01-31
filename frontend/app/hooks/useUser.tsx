import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface User {
  firstName: string;
  email: string;
  bloodType?: string;
  isVerified: boolean;
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Move this into an environment variable
  const API_URL =
    process.env.REACT_APP_API_URL ||
    `http://localhost:${process.env.PORT || 3001}`;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();

        // Better token validation
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
          // Add timeout and validateStatus
          timeout: 5000,
          validateStatus: (status) => status >= 200 && status < 300,
        });

        // Validate response data
        if (!response.data || !response.data.email) {
          throw new Error("Invalid user data received");
        }

        setUser(response.data);
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
