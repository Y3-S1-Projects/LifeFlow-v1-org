import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

interface AdminData {
  id: string;
  fullName: string;
  email: string;
  role: "superadmin" | "moderator" | "support";
}

interface FormData {
  email: string;
  password: string;
}

interface OtpData {
  otp: string;
}

// Separate the form component that will use the reCaptcha hook
const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [otpData, setOtpData] = useState<OtpData>({ otp: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // API base URL
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://lifeflow-v1-org-production.up.railway.app"
      : "http://localhost:3001";

  useEffect(() => {
    const fetchCsrfToken = async (): Promise<void> => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(data.csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        setError("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  useEffect(() => {
    let timer: number | undefined;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (showOtpForm) {
      setOtpData({ ...otpData, [e.target.name]: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (showOtpForm) {
        // Verify OTP
        const response = await axios.post<{
          success: boolean;
          admin: AdminData;
        }>(
          `${API_BASE_URL}/admin/verify-otp`,
          { email: formData.email, otp: otpData.otp },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const adminData = response.data.admin;
          localStorage.setItem("adminInfo", JSON.stringify(adminData));

          switch (adminData.role) {
            case "superadmin":
              router.push("/admin/dashboard");
              break;
            case "moderator":
              router.push("/admin/moderation");
              break;
            case "support":
              router.push("/support/dashboard");
              break;
            default:
              router.push("/admin/dashboard");
          }
        }
      } else {
        // Check if reCAPTCHA is available - just use the regular login if it's not
        let captchaToken = "";

        if (executeRecaptcha) {
          try {
            captchaToken = await executeRecaptcha("admin_login");
          } catch (captchaErr) {
            // Log but continue - don't block login if reCAPTCHA fails
            console.error("reCAPTCHA error:", captchaErr);
          }
        }

        // Login - proceed even if captchaToken is empty (server can handle this case)
        const response = await axios.post(
          `${API_BASE_URL}/admin/login`,
          { ...formData, captchaToken },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (response.data.requireOTP) {
          setShowOtpForm(true);
          setError("");
        } else if (response.data.success) {
          localStorage.setItem(
            "adminInfo",
            JSON.stringify(response.data.admin)
          );
          router.push("/admin/dashboard");
        } else {
          // Handle unexpected response format
          setError("Login response received but authentication failed");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/resend-otp`,
        { email: formData.email },
        {
          headers: {
            "X-CSRF-Token": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.retryAfter) {
        setResendCooldown(response.data.retryAfter);
      } else {
        setResendCooldown(60); // Default 60 second cooldown
      }

      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-600">LifeFlow</h1>
          <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!showOtpForm ? (
            <>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-2 text-center text-xs text-gray-500">
                This site is protected by reCAPTCHA v3
              </div>
            </>
          ) : (
            <div className="mb-6">
              <div className="text-center mb-4">
                <p className="text-gray-700">
                  We've sent a verification code to
                  <br />
                  <span className="font-semibold">{formData.email}</span>
                </p>
              </div>

              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-2"
              >
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otpData.otp}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-xl tracking-widest"
                required
                maxLength={6}
                pattern="\d{6}"
                autoComplete="one-time-code"
              />

              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || resendCooldown > 0}
                  className="text-sm text-red-600 hover:underline focus:outline-none"
                >
                  {resendCooldown > 0
                    ? `Resend code (${resendCooldown}s)`
                    : "Resend code"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !csrfToken}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 flex justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : showOtpForm ? (
              "Verify"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This portal is restricted to authorized admin personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

// Main AdminLogin component that provides the reCaptcha context
const AdminLogin: React.FC = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_REACT_APP_RECAPTCHA_SITE_KEY || ""}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default AdminLogin;
