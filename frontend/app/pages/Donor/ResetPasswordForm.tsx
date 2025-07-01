// app/donor/reset-password/ResetPasswordForm.tsx
"use client";

import { useSearchParams } from "next/navigation";
import ResetPassword from "./ResetPassword";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  return <ResetPassword token={token} email={email} />;
}
