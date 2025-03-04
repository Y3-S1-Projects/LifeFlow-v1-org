// components/RouteGuard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getRoleFromToken } from "../utils/auth";

type RouteGuardProps = {
  children: React.ReactNode;
  requiredRoles: string[];
};

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredRoles,
}) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run client-side
    if (typeof window === "undefined") return;
    // Function to check auth
    const checkAuth = () => {
      // First check if user is authenticated
      if (!isAuthenticated()) {
        // Save the attempted URL before redirecting
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/donor/login");
        return;
      }

      // Then check if user has required role - make case-insensitive
      const userRole = getRoleFromToken();
      // Case-insensitive role checking
      const hasRequiredRole =
        userRole &&
        requiredRoles.some(
          (role) => role.toLowerCase() === userRole.toLowerCase()
        );

      if (!hasRequiredRole) {
        router.push("/unauthorized");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    // Run auth check
    checkAuth();
  }, [requiredRoles, router]);

  // Initially show loading state until explicitly authorized
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};
