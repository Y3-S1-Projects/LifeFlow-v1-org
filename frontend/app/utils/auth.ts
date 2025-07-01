import { API_BASE_URL } from "../libs/utils";

export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    // If the request is successful and authentication is true
    if (data.authenticated === true) {
      return true;
    }

    // For public pages, this prevents throwing an error
    return false;
  } catch (error) {
    // Completely silent error handling
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

export const getAdminIdFromToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null; // Check if running on server

  try {
    // Make a request to get user info including ID
    const response = await fetch(`${API_BASE_URL}/auth/admin/me`, {
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
