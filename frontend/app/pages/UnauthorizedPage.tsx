import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn, Home } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleLoginClick}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login as Admin
          </Button>
          <Button onClick={handleHomeClick} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
