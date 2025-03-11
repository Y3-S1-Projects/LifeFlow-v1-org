const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://lifeflow-v1-org-production.up.railway.app"
    : "http://localhost:3001";

export const logout = async () => {
  try {
    // Get the token from wherever you store it (localStorage, sessionStorage, etc.)
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Clear token and any user data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Any other stored auth data

      // Redirect to login page or home page
      window.location.href = "/"; // or use your router's navigation method
    } else {
      console.error("Logout failed:", data.message);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};
