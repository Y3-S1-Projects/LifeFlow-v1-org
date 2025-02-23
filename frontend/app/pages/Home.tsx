"use client";
import React, { useState, useEffect, useRef } from "react";
import { Heart, Sun, Moon, Menu, X, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "../libs/utils";
import Footer from "../components/Footer";
import GlobalHeader from "../components/GlobalHeader";

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const threeContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { label: "Active Donors", value: "10,000+" },
    { label: "Lives Saved", value: "25,000+" },
    { label: "Blood Banks", value: "500+" },
    { label: "Cities Covered", value: "100+" },
  ];

  return (
    <div
      className={cn(
        "min-h-screen w-full transition-colors duration-300",
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      )}
    >
      {/* Header */}
      <GlobalHeader
        scrolled={scrolled}
        isDarkMode={isDarkMode}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      {/*<header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 shadow-md backdrop-blur-sm"
            : "bg-transparent",
          isDarkMode && "bg-gray-900/90"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href="/">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-500 animate-pulse" />
                <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  LifeFlow
                </span>
              </div>
            </Link>


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

          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      */}

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent animate-fade-in">
              Save Lives Through
              <br />
              Blood Donation
            </h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 animate-slide-up">
              Your donation can save up to three lives. Join our community of
              heroes today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in">
              <Link href="/donor-registration">
                <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Become a Donor
                </button>
              </Link>
              <Link href="/organizer-registration">
                <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-full font-medium transform hover:scale-105 transition-all duration-200">
                  Organize a Camp
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-2xl sm:text-4xl font-bold text-red-500 mb-4">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-base text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isDarkMode ? (
          <Sun className="w-6 h-6 text-yellow-500" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800" />
        )}
      </button>
    </div>
  );
};

export default Home;
