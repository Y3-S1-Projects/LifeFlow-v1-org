"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiResponse {
  message: string;
  success: boolean;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

const VerifyOtp: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0); // Track OTP attempts

  const handleVerifyOtp = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const requestBody: VerifyOtpRequest = {
        email,
        otp,
      };

      const response = await fetch("http://localhost:3001/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data: ApiResponse = await response.json();
      if (!response.ok) {
        if (data.message === "Too many attempts") {
          setAttempts(3); // Set attempts to max if limit is reached
        }
        throw new Error(data.message);
      }

      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string): void => {
    const cleanedValue = value.replace(/[^0-9]/g, ""); // Only allow numbers
    if (cleanedValue.length <= 6) {
      setOtp(cleanedValue);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    // Implement resend logic here
    console.log("Resending code to:", email);
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
              disabled={attempts >= 3} // Disable resend button when limit is reached
            >
              Didn't receive the code? Resend
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
