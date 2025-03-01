import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn, Home, Heart } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/donor/login");
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4 w-full">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-red-600">
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-red-700">
          Access Restricted
        </h1>

        <div className="flex items-center justify-center mb-6">
          <Heart className="h-5 w-5 text-red-500 mr-1 fill-red-500" />
          <span className="text-sm font-medium text-red-500">
            LifeFlow Blood Donation
          </span>
        </div>

        <p className="text-gray-700 mb-8">
          This area is reserved for authorized personnel. Please log in with
          your credentials or return to the main site.
        </p>

        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-4">
          <Button
            onClick={handleLoginClick}
            className="bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>

          <Button
            variant="outline"
            onClick={handleHomeClick}
            className="border-red-200 text-red-700 hover:bg-red-50 flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          Need help? Contact donor support at support@lifeflow.org
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
