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
    const checkAuth = async () => {
      try {
        // First check if user is authenticated
        const authenticated = await isAuthenticated();

        if (!authenticated) {
          sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname
          );
          router.push("/donor/login");
          return;
        }

        // Then check if user has required role
        const userRole = await getRoleFromToken();

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
      } catch (error) {
        console.error("Authentication check failed:", error);
        // On error, redirect to login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        router.push("/donor/login");
      } finally {
        setLoading(false);
      }
    };

    // Run auth check
    checkAuth();
  }, [requiredRoles, router]);

  // Show loading state until authentication check completes
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authorized and not loading, the useEffect will handle redirection
  if (!authorized) {
    return null;
  }

  // Render children only if authorized
  return <>{children}</>;
};
