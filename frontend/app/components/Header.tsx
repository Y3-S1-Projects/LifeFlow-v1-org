import React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  User,
  Droplet,
} from "lucide-react";
import useUser from "../hooks/useUser";
import { useDarkMode } from "../contexts/DarkModeContext";

const Header: React.FC = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const { darkMode } = useDarkMode();

  if (loading)
    return <div className="bg-red-50 p-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="bg-red-100 text-red-800 p-4 text-center">{error}</div>
    );

  const logOut = async (): Promise<void> => {
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

  const customeNavigate = (path: string): void => {
    router.push(path);
  };

  const navLinks = {
    Dashboard: "/donor-dashboard",
    Appointments: "/donor-appointments",
    "My Donations": "/my-donations",
  };

  type NavLinkKey = keyof typeof navLinks;

  return (
    <header
      className={`
        shadow-md transition-all duration-300 
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

          {/* Navigation Links */}
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
                  <span
                    className="
                      absolute bottom-[-3px] left-0 w-0 h-0.5 bg-red-600 
                      transition-all duration-300 
                      group-hover:w-full
                    "
                  />
                </a>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                  flex items-center space-x-2 p-2 rounded-md 
                  transition-colors duration-200
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
                    className={`
                      cursor-pointer 
                      ${
                        darkMode
                          ? "hover:bg-gray-700 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }
                    `}
                    onClick={() => customeNavigate("/donor-profile")}
                  >
                    <User className="mr-2 h-4 w-4 text-red-500" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`
                      cursor-pointer 
                      ${
                        darkMode
                          ? "hover:bg-gray-700 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }
                    `}
                    onClick={() => customeNavigate("/donor-settings")}
                  >
                    <Settings className="mr-2 h-4 w-4 text-red-500" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuItem
                className={`
                  cursor-pointer 
                  ${
                    darkMode
                      ? "hover:bg-gray-700 focus:bg-gray-700"
                      : "hover:bg-gray-50 focus:bg-gray-50"
                  }
                `}
              >
                <HelpCircle className="mr-2 h-4 w-4 text-red-500" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator
                className={`
                  ${darkMode ? "border-gray-700" : "border-gray-200"}
                `}
              />
              <DropdownMenuItem
                onClick={logOut}
                className={`
                  cursor-pointer text-red-600 
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
      </div>
    </header>
  );
};

export default Header;
