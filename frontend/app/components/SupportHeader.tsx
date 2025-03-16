import React, { useState } from "react";
import {
  Bell,
  Menu,
  X,
  User,
  Droplet,
  MapPin,
  HeartPulse,
  Settings,
  HelpCircle,
} from "lucide-react";

interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const SupportHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const navLinks: NavLink[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Droplet className="h-5 w-5" />,
      isActive: true,
    },
    { name: "Camps", path: "/camps", icon: <MapPin className="h-5 w-5" /> },
    {
      name: "Donor Support",
      path: "/donor-support",
      icon: <HeartPulse className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    { name: "Help", path: "/help", icon: <HelpCircle className="h-5 w-5" /> },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2">
              <Droplet className="h-7 w-7 text-red-600" />
              <span className="font-bold text-lg text-gray-800">
                BloodFinder
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Support
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors
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
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-1 rounded-full text-gray-600 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-800">Ashok Kumar</p>
                <p className="text-xs text-gray-500">Support Agent</p>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
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
                className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md
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

            <div className="flex items-center gap-2 px-3 py-2 border-t mt-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Ashok Kumar</p>
                <p className="text-xs text-gray-500">Support Agent</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SupportHeader;
