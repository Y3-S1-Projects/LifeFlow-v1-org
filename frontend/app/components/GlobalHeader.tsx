import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, X, Menu, User, LogOut } from "lucide-react";
import { cn } from "../libs/utils";
import useUser from "../hooks/useUser";
import Loader from "../components/Loader";
import { useRouter } from "next/navigation";
import { logout } from "../services/authService";

interface HeaderProps {
  scrolled: boolean;
  isDarkMode: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user?: {
    name: string;
    email: string;
  } | null;
}

const GlobalHeader: React.FC<HeaderProps> = ({
  scrolled,
  isDarkMode,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const { user, loading, error } = useUser();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Define menuItems inside the component
  const menuItems = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Donate", href: "/donate" },
    { title: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ",
        scrolled ? "bg-white/90 shadow-md backdrop-blur-sm" : "bg-transparent",
        isDarkMode && "bg-gray-900/90"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                LifeFlow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="relative group"
              >
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-red-600"
                  )}
                >
                  {item.title}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full" />
              </Link>
            ))}

            {/* User Section for Desktop with Loading State */}
            {loading ? (
              <div className="px-3 py-1 rounded-full">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="w-16 h-4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                </div>
              </div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-1 rounded-full transition-colors",
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className={cn(
                      "absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50",
                      isDarkMode ? "bg-gray-800" : "bg-white",
                      "border",
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    )}
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    {user.role === "User" && (
                      <>
                        <Link
                          href="/donor/profile"
                          className={cn(
                            "block px-4 py-2 text-sm",
                            isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-red-50"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </div>
                        </Link>
                      </>
                    )}

                    {user.role === "Organizer" && (
                      <>
                        <Link
                          href="/organizer/profile"
                          className={cn(
                            "block px-4 py-2 text-sm",
                            isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-red-50"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </div>
                        </Link>
                      </>
                    )}

                    <Link
                      href="#"
                      onClick={handleLogout}
                      className={cn(
                        "block px-4 py-2 text-sm",
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-red-50"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/donor/register"
                className={cn(
                  "px-4 py-1 rounded-full text-sm font-medium transition-colors",
                  isDarkMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-500 text-white hover:bg-red-600"
                )}
              >
                Join
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden fixed top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="px-4 pt-4 pb-8 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="block px-4 py-2 rounded-md text-lg font-medium hover:bg-red-50 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}

            {/* User Section for Mobile with Loading State */}
            {loading ? (
              <div className="mt-4 border-t pt-4 dark:border-gray-700">
                <div className="px-4 py-2">
                  <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="w-20 h-5 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : user ? (
              <>
                <div className="mt-4 border-t pt-4 dark:border-gray-700">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Signed in as {user.name}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-lg font-medium hover:bg-red-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-lg font-medium hover:bg-red-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </Link>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-4 py-2 mt-4 text-center rounded-md text-lg font-medium bg-red-500 text-white hover:bg-red-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
