"use client";
import { Suspense } from "react";
import ResetPasswordForm from "@/app/pages/Donor/ResetPasswordForm";
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
