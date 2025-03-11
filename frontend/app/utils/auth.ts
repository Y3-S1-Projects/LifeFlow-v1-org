// utils/auth.ts

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://lifeflow-v1-org-production.up.railway.app"
    : "http://localhost:3001";

// Function to check if the user is authenticated by verifying session cookies
export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false; // Check if running on server

  try {
    // With HTTP-only cookies, we can't directly check for the cookie
    // Instead, make a lightweight auth verification request to the server
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (err) {
    console.error("Error verifying authentication:", err);
    return false;
  }
};

// Function to get user role from the server
export const getRoleFromToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null; // Check if running on server

  try {
    // Make a request to get user info including role
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include", // Important for sending cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

// Function to get user ID from the server
export const getUserIdFromToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null; // Check if running on server

  try {
    // Make a request to get user info including ID
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      credentials: "include", // Important for sending cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.userId || null;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
};

// For backward compatibility during transition (will be removed later)
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null; // Check if running on server

  try {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return null;
    return token;
  } catch (err) {
    console.error("Error retrieving token:", err);
    return null;
  }
};
