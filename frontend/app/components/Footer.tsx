import React from "react";
import Link from "next/link";
import { Heart, Mail } from "lucide-react"; // Assuming you're using lucide-react for icons
import { TbBrandFacebook } from "react-icons/tb"; // Assuming you're using react-icons for Facebook
import { FaXTwitter, FaInstagram } from "react-icons/fa6"; // Assuming you're using react-icons for Twitter and Instagram
import { cn } from "@/lib/utils"; // Assuming you have a utility function for class names

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer
      className={cn(
        "pt-8 border-t",
        isDarkMode
          ? "border-gray-800 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-black"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold">LifeFlow</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecting blood donors with those in need, saving lives one
              donation at a time.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2" role="list">
              <li role="listitem">
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/donate"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Donate Blood
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/centers"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Donation Centers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2" role="list">
              <li role="listitem">
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  FAQs
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li role="listitem">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <TbBrandFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Email"
                className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div
          className={cn(
            "mt-8 pt-8 border-t text-center text-sm",
            isDarkMode
              ? "border-gray-800 text-gray-400"
              : "border-gray-200 text-gray-600"
          )}
        >
          © {new Date().getFullYear()} LifeFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
