"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Menu, X, User, Droplet, HeartPulse, ChevronDown } from "lucide-react";
import { getAdminIdFromToken } from "../utils/auth";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface Agent {
  _id: string;
  fullName: string;
  email: string;
  role: "superadmin" | "moderator" | "support";
}

const SupportHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await getAdminIdFromToken();
        if (!userId || userId.trim() === "") {
          router.push("/unauthorized");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/profile`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/unauthorized");
          return;
        }

        const data = await response.json();
        setAuthorized(true);
        setAgent(data.admin);
      } catch (err) {
        router.push("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logOut = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        router.push("/");
      }
    } catch {
      console.error("Error logging out");
    }
  };

  // Main navigation links
  const navLinks: NavLink[] = [
    {
      name: "Dashboard",
      path: "dashboard",
      icon: <Droplet className="h-5 w-5" />,
    },
    {
      name: "Donor Support",
      path: "/donor-support",
      icon: <HeartPulse className="h-5 w-5" />,
    },
  ];

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <Loader />
      </div>
    );

  if (!authorized) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Droplet className="h-7 w-7 text-red-600" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-800 tracking-tight">
                    Life Flow
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    Support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${
                    link.isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50/50"
                  }`}
              >
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 transition-opacity duration-300 ${
                    link.isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                {link.icon}
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative group">
              {/* <button className="relative p-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">
                    {notificationCount}
                  </span>
                )}
              </button> */}

              {/* Notification dropdown (hidden by default) */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Notifications</h4>
                  <p className="text-xs text-gray-500">
                    You have {notificationCount} unread messages
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <Droplet className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        New donation request
                      </p>
                      <p className="text-xs text-gray-500">
                        Camp #34 needs A+ blood type urgently
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        New donor registered
                      </p>
                      <p className="text-xs text-gray-500">
                        Rahul Sharma has registered as a donor
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100">
                  <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1.5 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-800">
                    {agent?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{agent?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>

              {/* User dropdown (hidden by default) */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {agent?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{agent?.email}</p>
                </div>
                <div className="py-1">
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      logOut().then(() => window.location.reload());
                    }}
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white border-t">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`flex items-center gap-2 px-3 py-2.5 text-base font-medium rounded-md transition-colors
                  ${
                    link.isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
              >
                {link.icon}
                {link.name}
              </a>
            ))}

            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Nimsara Thenuka
                  </p>
                  <p className="text-xs text-gray-500">Support Agent</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <a
                  href="/profile"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Your Profile
                </a>
                <a
                  href="/settings"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Settings
                </a>
                <a
                  href="/logout"
                  className="block px-3 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-md"
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SupportHeader;
