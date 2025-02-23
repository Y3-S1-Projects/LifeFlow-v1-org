import React from "react";
import Link from "next/link";
import { Heart, X, Menu } from "lucide-react";
import { cn } from "../libs/utils";

interface HeaderProps {
  scrolled: boolean;
  isDarkMode: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const GlobalHeader: React.FC<HeaderProps> = ({
  scrolled,
  isDarkMode,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  // Define menuItems inside the component
  const menuItems = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Donate", href: "/donate" },
    { title: "Contact", href: "/contact" },
    { title: "Login", href: "/login" },
  ];

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
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
