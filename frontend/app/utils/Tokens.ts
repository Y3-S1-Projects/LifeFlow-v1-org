import axios from "axios";
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://lifeflow-v1-org-production.up.railway.app"
    : "http://localhost:3001";

export const getCsrfToken = async (): Promise<string | undefined> => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
      withCredentials: true,
    });
    return data.csrfToken;
  } catch (err) {
    console.error("CSRF token fetch error:", err);
    return undefined;
  }
};
