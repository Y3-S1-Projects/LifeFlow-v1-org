import React, { useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";

interface NotificationDisplayProps {
  error?: string;
  success?: string;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  error,
  success,
}) => {
  const prevErrorRef = useRef<string | undefined>(undefined);
  const prevSuccessRef = useRef<string | undefined>(undefined);
  const timestampRef = useRef<number>(Date.now());

  useEffect(() => {
    const currentTime = Date.now();

    if (
      error &&
      (error !== prevErrorRef.current ||
        currentTime - timestampRef.current >= 100)
    ) {
      toast.error(error, {
        style: {
          background: "#FEE2E2",
          border: "1px solid #EF4444",
          color: "#DC2626",
        },
      });
      prevErrorRef.current = error;
      timestampRef.current = currentTime;
    }

    if (
      success &&
      (success !== prevSuccessRef.current ||
        currentTime - timestampRef.current >= 100)
    ) {
      toast.success(success, {
        style: {
          background: "#DCFCE7",
          border: "1px solid #22C55E",
          color: "#16A34A",
        },
      });
      prevSuccessRef.current = success;
      timestampRef.current = currentTime;
    }
  }, [error, success]);

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          padding: "16px",
        },
      }}
    />
  );
};

export default NotificationDisplay;
