// utils/auth.ts
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

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

export const getRoleFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // Split the token into its parts (JWT has 3 parts: header, payload, signature)
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("Invalid token format");
    }

    // Convert Base64Url to Base64
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Decode Base64 to JSON string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    // Parse JSON string into an object
    const payload = JSON.parse(jsonPayload);

    // Assuming the role is stored under a property like 'role'
    return payload.role || null; // Return the role if found
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
