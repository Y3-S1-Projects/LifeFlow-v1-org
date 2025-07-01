import axios from "axios";
import { API_BASE_URL } from "../libs/utils";

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
