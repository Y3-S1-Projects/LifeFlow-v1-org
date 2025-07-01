"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Modal from "../components/Modal";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loader from "../components/Loader";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../libs/utils";

interface ApiResponse {
  message: string;
  success: boolean;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// Create a separate component to handle the search params logic
const VerifyOtpContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timer, setTimer] = useState(5);

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
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  const handleVerifyOtp = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const requestBody: VerifyOtpRequest = {
        email,
        otp,
      };

      const response = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data: ApiResponse = await response.json();
      if (!response.ok) {
        if (data.message === "Too many attempts") {
          setAttempts(3);
        }
        throw new Error(data.message);
      }

      setMessage("OTP Verified successfully!");
      setIsModalOpen(true);
      startTimer();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string): void => {
    const cleanedValue = value.replace(/[^0-9]/g, "");
    if (cleanedValue.length <= 6) {
      setOtp(cleanedValue);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setAttempts(0);
        setError("");
        setMessage("OTP sent successfully!");
        setIsModalOpen(true);
        startTimer();
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error sending OTP");
    }
  };

  const handleCloseModal = () => {
    router.push("/donor/login");
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center">
        <Heart className="w-8 h-8 text-red-500 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">LifeFlow</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            Please enter the verification code sent to
            <span className="font-medium text-gray-900 block">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <InputOTP maxLength={6} onChange={handleInputChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-sm text-gray-500 text-center">
              The code will expire in 5 minutes
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {attempts >= 3 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Too many attempts. Please request a new OTP.
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6 || attempts >= 3}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-gray-600"
              onClick={handleResendCode}
              disabled={attempts >= 3}
            >
              Didn&apos;t receive the code? Resend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal for success message */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <h3>{message}</h3>
        <p>
          Redirecting to login page in <strong>{timer}</strong> seconds...
        </p>
        <button
          onClick={handleCloseModal}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          Proceed to Login
        </button>
      </Modal>
    </div>
  );
};

// Main component with Suspense boundary
const VerifyOtp: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtp;
