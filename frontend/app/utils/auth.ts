// utils/auth.ts
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return null;
    return token;
  } catch (err) {
    console.error("Error retrieving token:", err);
    return null;
  }
};
