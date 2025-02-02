import React from "react";
import Link from "next/link";
import { Heart, Mail } from "lucide-react"; // Assuming you're using lucide-react for icons
import { TbBrandFacebook } from "react-icons/tb"; // Assuming you're using react-icons for Twitter
import { FaXTwitter, FaInstagram } from "react-icons/fa6"; // Assuming you're using react-icons for Facebook and Instagram
import { cn } from "@/lib/utils"; // Assuming you have a utility function for class names

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer
      className={cn(
        "py-8   border-t ",
        isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white "
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold">Life Flow</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecting blood donors with those in need, saving lives one
              donation at a time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link
                  href="/centers"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  Donation Centers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-red-500">
                <TbBrandFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} LifeFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
