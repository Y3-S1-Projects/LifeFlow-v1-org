import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Droplet,
  Menu,
  X,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { useDarkMode } from "../contexts/DarkModeContext";

const Header = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const { darkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading)
    return <div className="bg-red-50 p-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="bg-red-100 text-red-800 p-4 text-center">{error}</div>
    );

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

  const customNavigate = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const navLinks = {
    Dashboard: "/donor-dashboard",
    Appointments: "/donor-appointments",
    "My Donations": "/my-donations",
  };

  type NavLinkKey = keyof typeof navLinks;

  return (
    <>
      <header
        className={`
          shadow-md transition-all duration-300 relative z-20
          ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}
        `}
      >
        <div className="w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo with Blood Droplet */}
            <div className="flex items-center space-x-2">
              <Droplet className="text-red-600 w-8 h-8" />
              <span className="text-2xl font-bold text-red-600">LifeFlow</span>
            </div>

            {/* Desktop Navigation Links */}
            {user?.isEligible && (
              <nav className="hidden md:flex items-center space-x-6">
                {(Object.keys(navLinks) as NavLinkKey[]).map((item) => (
                  <a
                    key={item}
                    href={navLinks[item]}
                    className={`
                      transition-colors duration-200 
                      ${
                        darkMode
                          ? "text-gray-300 hover:text-red-400"
                          : "text-gray-700 hover:text-red-600"
                      } 
                      font-medium relative group
                    `}
                  >
                    {item}
                    <span className="absolute bottom-[-3px] left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}
              </nav>
            )}

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`
                      flex items-center space-x-2 p-2 rounded-md transition-colors duration-200
                      ${
                        darkMode
                          ? "hover:bg-gray-800 text-gray-200"
                          : "hover:bg-gray-100 text-gray-800"
                      }
                    `}
                  >
                    <span className="font-medium">{user?.firstName}</span>
                    <ChevronDown className="h-4 w-4 text-red-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className={`
                    w-56 
                    ${
                      darkMode
                        ? "bg-gray-800 text-gray-200 border-gray-700"
                        : "bg-white text-gray-800 border-gray-200"
                    }
                  `}
                >
                  {user?.isEligible && (
                    <>
                      <DropdownMenuItem
                        className={`cursor-pointer ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}
                        onClick={() => customNavigate("/donor-profile")}
                      >
                        <User className="mr-2 h-4 w-4 text-red-500" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`cursor-pointer ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}
                        onClick={() => customNavigate("/donor-settings")}
                      >
                        <Settings className="mr-2 h-4 w-4 text-red-500" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    className={`cursor-pointer ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <HelpCircle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator
                    className={darkMode ? "border-gray-700" : "border-gray-200"}
                  />
                  <DropdownMenuItem
                    onClick={logOut}
                    className={`cursor-pointer text-red-600 ${
                      darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
                    }`}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-red-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Custom Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Menu */}
          <div
            className={`
              fixed top-0 right-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out
              ${
                darkMode
                  ? "bg-gray-900 text-gray-100"
                  : "bg-white text-gray-900"
              }
              ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <div className="p-4">
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="h-6 w-6 text-red-500" />
              </button>

              {/* User Info */}
              <div className="mt-8 mb-6 flex items-center space-x-3">
                <User className="h-8 w-8 text-red-500" />
                <span className="font-medium text-lg">{user?.firstName}</span>
              </div>

              {/* Navigation Links */}
              {user?.isEligible && (
                <div className="space-y-4">
                  {Object.entries(navLinks).map(([name, path]) => (
                    <button
                      key={name}
                      onClick={() => customNavigate(path)}
                      className={`
                        w-full text-left py-2 px-4 rounded-lg transition-colors duration-200
                        ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}
                      `}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {/* Menu Items */}
              <div className="mt-6 space-y-4">
                {user?.isEligible && (
                  <>
                    <button
                      onClick={() => customNavigate("/donor-profile")}
                      className={`
                        w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 flex items-center
                        ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}
                      `}
                    >
                      <User className="mr-3 h-5 w-5 text-red-500" />
                      Profile
                    </button>
                    <button
                      onClick={() => customNavigate("/donor-settings")}
                      className={`
                        w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 flex items-center
                        ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}
                      `}
                    >
                      <Settings className="mr-3 h-5 w-5 text-red-500" />
                      Settings
                    </button>
                  </>
                )}
                <button
                  className={`
                    w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 flex items-center
                    ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}
                  `}
                >
                  <HelpCircle className="mr-3 h-5 w-5 text-red-500" />
                  Support
                </button>
                <button
                  onClick={logOut}
                  className={`
                    w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 flex items-center text-red-600
                    ${darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"}
                  `}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
