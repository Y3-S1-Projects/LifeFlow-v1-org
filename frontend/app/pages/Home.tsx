"use client";
import React, { useState, useEffect, useRef } from "react";
import { Heart, Sun, Moon, Menu, X, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "../libs/utils";
import Footer from "../components/Footer";
import GlobalHeader from "../components/GlobalHeader";
import useUser from "../hooks/useUser";
import Loader from "../components/Loader";

const Home = () => {
  const { user, loading, error } = useUser();
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
  if (loading) {
    return (
      <div className=" flex items-center justify-center">
        <Loader />
      </div>
    );
  }

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
            {!loading ? (
              <>
                {!user && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in">
                    <Link href="/donor/login">
                      <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Become a Donor
                      </button>
                    </Link>
                    <Link href="/organizer/login">
                      <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-full font-medium transform hover:scale-105 transition-all duration-200">
                        Organize a Camp
                      </button>
                    </Link>
                  </div>
                )}

                {user && user.role === "User" && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in">
                    <Link href="/donor/dashboard">
                      <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                        My Dashboard
                      </button>
                    </Link>
                  </div>
                )}

                {user && user.role === "Organizer" && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 animate-fade-in">
                    <Link href="/organizer/dashboard">
                      <button className="w-full sm:w-auto px-6 py-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                        My Dashboard
                      </button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify">
                <Loader />
              </div>
            )}
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
