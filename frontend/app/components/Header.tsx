import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  User,
  Heart,
  Menu,
  X,
  Calendar,
  PieChart,
  Home,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { useDarkMode } from "../contexts/DarkModeContext";

const Header = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Update current path when component mounts and when route changes
  useEffect(() => {
    // Get the current path from window.location
    setCurrentPath(window.location.pathname);

    // Listen for route changes
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Add event listener for popstate (browser back/forward navigation)
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-16 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/30 flex items-center justify-center">
        <p className="text-red-700 dark:text-red-400 text-sm font-medium">
          {error}
        </p>
      </div>
    );
  }

  const logOut = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setCurrentPath(path); // Update current path immediately for better UX
    setIsMobileMenuOpen(false);
  };

  // Check if a path is active (exact match or starts with the path)
  const isActive = (path: string) => {
    return (
      currentPath === path || (path !== "/" && currentPath.startsWith(path))
    );
  };

  // Navigation configurations based on user role
  const navConfig = {
    User: [
      { label: "Home", path: "/donor/dashboard", icon: <Home size={18} /> },
      {
        label: "Appointments",
        path: "/donor/appointments",
        icon: <Calendar size={18} />,
      },
      {
        label: "My Donations",
        path: "/donor/donations",
        icon: <Heart size={18} />,
      },
    ],
    Organizer: [
      {
        label: "Dashboard",
        path: "/organizer/dashboard",
        icon: <PieChart size={18} />,
      },
      { label: "Camps", path: "/organizer/camps", icon: <Home size={18} /> },
    ],
  };

  // Determine which navigation to show based on user role
  const currentNav =
    user?.role === "Organizer"
      ? navConfig.Organizer
      : user?.isEligible
      ? navConfig.User
      : [];

  return (
    <header
      className={`
      w-full border-b transition-colors duration-300 sticky top-0 z-30
      ${
        darkMode
          ? "bg-gray-900 border-gray-800 text-white"
          : "bg-white border-gray-100 text-gray-900"
      }
    `}
    >
      <div className="w-full md:w-3/4 lg:w-3/4 mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Heart
                className="w-8 h-8 text-red-600 fill-current"
                strokeWidth={1.5}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                LifeFlow
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentNav.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1
                  transition-colors duration-200 relative
                  ${
                    isActive(item.path)
                      ? darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-red-50 text-red-700"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }
                `}
              >
                <span
                  className={`${
                    isActive(item.path) ? "text-red-600" : "text-red-600"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {/* Active indicator line */}
                {isActive(item.path) && (
                  <span className="absolute -bottom-px left-0 w-full h-0.5 bg-red-600 rounded-t"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-full transition-colors duration-200
                ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`
                    flex items-center space-x-3 px-3 py-2 rounded-md text-sm
                    transition-colors duration-200
                    ${
                      darkMode
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                    }
                  `}
                  >
                    <div
                      className={`
                      p-2 rounded-full
                      ${darkMode ? "bg-gray-700" : "bg-gray-200"}
                    `}
                    >
                      <User className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{user?.firstName}</div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user?.role}{" "}
                        {user?.role === "User" && (
                          <span>
                            •
                            {user?.bloodType === "not sure"
                              ? "Blood type not set"
                              : user?.bloodType || "Blood type not set"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`
                    w-56 p-1 
                    ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }
                  `}
                >
                  {/* Profile for both roles */}
                  {user?.role === "User" && !user.isEligible ? null : (
                    <DropdownMenuItem
                      className={`cursor-pointer flex items-center p-2 rounded-md
                      ${
                        isActive(
                          user?.role === "Organizer"
                            ? "/organizer/profile"
                            : "/donor/profile"
                        )
                          ? darkMode
                            ? "bg-gray-700"
                            : "bg-red-50 text-red-700"
                          : darkMode
                          ? "hover:bg-gray-700 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }
                    `}
                      onClick={() =>
                        navigateTo(
                          user?.role === "Organizer"
                            ? "/organizer/profile"
                            : "/donor/profile"
                        )
                      }
                    >
                      <User className="mr-2 h-4 w-4 text-red-500" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  )}

                  {/* Settings for both roles */}
                  {user?.role === "User" && !user.isEligible ? null : (
                    <DropdownMenuItem
                      className={`cursor-pointer flex items-center p-2 rounded-md
                      ${
                        isActive(
                          user?.role === "Organizer"
                            ? "/organizer/settings"
                            : "/donor/settings"
                        )
                          ? darkMode
                            ? "bg-gray-700"
                            : "bg-red-50 text-red-700"
                          : darkMode
                          ? "hover:bg-gray-700 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }
                    `}
                      onClick={() =>
                        navigateTo(
                          user?.role === "Organizer"
                            ? "/organizer/settings"
                            : "/donor/settings"
                        )
                      }
                    >
                      <Settings className="mr-2 h-4 w-4 text-red-500" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  )}

                  {/* Support */}
                  <DropdownMenuItem
                    className={`cursor-pointer flex items-center p-2 rounded-md
                      ${
                        isActive("/support")
                          ? darkMode
                            ? "bg-gray-700"
                            : "bg-red-50 text-red-700"
                          : darkMode
                          ? "hover:bg-gray-700 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }
                    `}
                    onClick={() => navigateTo("/support")}
                  >
                    <HelpCircle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Support</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator
                    className={
                      darkMode ? "bg-gray-700 my-1" : "bg-gray-200 my-1"
                    }
                  />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={logOut}
                    className={`cursor-pointer flex items-center p-2 rounded-md text-red-600
                      ${
                        darkMode
                          ? "hover:bg-red-900/20 focus:bg-red-900/20"
                          : "hover:bg-red-50 focus:bg-red-50"
                      }
                    `}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-md
                ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile menu panel */}
          <div
            className={`
            fixed inset-y-0 right-0 max-w-xs w-full z-50 flex flex-col
            shadow-xl overflow-y-auto transition transform
            ${darkMode ? "bg-gray-900" : "bg-white"}
          `}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart
                  className="h-6 w-6 text-red-600 fill-current"
                  strokeWidth={1.5}
                />
                <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  LifeFlow
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2 rounded-md ${
                  darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-2 pt-2 pb-3 space-y-1 border-b border-gray-200 dark:border-gray-700">
              {/* User info panel */}
              <div
                className={`
                p-4 rounded-lg mb-2
                ${darkMode ? "bg-gray-800" : "bg-gray-50"}
              `}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    p-2 rounded-full
                    ${darkMode ? "bg-gray-700" : "bg-gray-200"}
                  `}
                  >
                    <User className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user?.role}{" "}
                      {user?.role === "User" && (
                        <span>
                          •
                          {user?.bloodType === "not sure"
                            ? "Blood type not set"
                            : user?.bloodType || "Blood type not set"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              {currentNav.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigateTo(item.path)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium
                    ${
                      isActive(item.path)
                        ? darkMode
                          ? "bg-gray-800 text-white"
                          : "bg-red-50 text-red-700"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }
                    ${isActive(item.path) ? "relative" : ""}
                  `}
                >
                  <span className="text-red-600">{item.icon}</span>
                  <span>{item.label}</span>

                  {/* Mobile active indicator */}
                  {isActive(item.path) && <span className="rounded-r"></span>}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-2 py-3 space-y-1">
              <button
                onClick={() =>
                  navigateTo(
                    user?.role === "Organizer"
                      ? "/organizer/profile"
                      : "/donor/profile"
                  )
                }
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium relative
                  ${
                    isActive(
                      user?.role === "Organizer"
                        ? "/organizer/profile"
                        : "/donor/profile"
                    )
                      ? darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-red-50 text-red-700"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }
                `}
              >
                <User className="h-5 w-5 text-red-500" />
                <span>Profile</span>

                {isActive(
                  user?.role === "Organizer"
                    ? "/organizer/profile"
                    : "/donor/profile"
                ) && <span className=" w-1 bg-red-600 rounded-r"></span>}
              </button>

              <button
                onClick={() =>
                  navigateTo(
                    user?.role === "Organizer"
                      ? "/organizer/settings"
                      : "/donor/settings"
                  )
                }
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium relative
                  ${
                    isActive(
                      user?.role === "Organizer"
                        ? "/organizer/settings"
                        : "/donor/settings"
                    )
                      ? darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-red-50 text-red-700"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }
                `}
              >
                <Settings className="h-5 w-5 text-red-500" />
                <span>Settings</span>

                {isActive(
                  user?.role === "Organizer"
                    ? "/organizer/settings"
                    : "/donor/settings"
                ) && <span className=" w-1 bg-red-600 rounded-r"></span>}
              </button>

              <button
                onClick={() => navigateTo("/support")}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium relative
                  ${
                    isActive("/support")
                      ? darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-red-50 text-red-700"
                      : darkMode
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }
                `}
              >
                <HelpCircle className="h-5 w-5 text-red-500" />
                <span>Support</span>

                {isActive("/support") && (
                  <span className=" w-1 bg-red-600 rounded-r"></span>
                )}
              </button>

              <button
                onClick={logOut}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-600
                  ${darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"}
                `}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
