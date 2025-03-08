import React, { useEffect, useState } from "react";
import { Save, Bell, Moon, Sun, Globe, Info } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useDarkMode } from "../contexts/DarkModeContext";
import Loader from "../components/Loader";
import useUser from "../hooks/useUser";
import { useRouter } from "next/navigation";

interface Settings {
  darkMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  donationReminders: boolean;
  bloodShortageAlerts: boolean;
  language: string;
  savedSuccess: boolean;
}

type SettingKey = keyof Omit<Settings, "savedSuccess" | "language">;

const DonorSettings = () => {
  const { user } = useUser();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    donationReminders: true,
    bloodShortageAlerts: true,
    language: "english",
    savedSuccess: false,
  });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync the local darkMode state with the context darkMode state
  useEffect(() => {
    if (isClient) {
      setSettings((prev) => ({
        ...prev,
        darkMode,
      }));
    }
  }, [darkMode, isClient]);

  useEffect(() => {
    if (!user) return; // Ensure user is available before proceeding

    if (!user.isEligible) {
      setLoading(true);
      router.replace(
        `/donor/dashboard?message=${encodeURIComponent(
          "Complete your profile to access more features"
        )}`
      );
      return;
    }

    setLoading(false);
  }, [user, router]);

  const handleToggle = (setting: SettingKey) => {
    if (setting === "darkMode") {
      toggleDarkMode();
    }

    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));

    setHasChanges(true);
  };

  const handleSave = () => {
    setSettings((prev) => ({
      ...prev,
      savedSuccess: true,
    }));

    setHasChanges(false);

    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        savedSuccess: false,
      }));
    }, 3000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      language: e.target.value,
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          ${
            isClient && darkMode
              ? "bg-gray-900 text-white"
              : "bg-gray-50 text-gray-900"
          }
          min-h-screen
        `}
      >
        <Loader />
        <p className="mt-4 text-lg">Loading your settings...</p>
      </div>
    );
  }

  if (error)
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          ${
            isClient && darkMode
              ? "bg-gray-900 text-red-400"
              : "bg-gray-50 text-red-500"
          }
          min-h-screen
        `}
      >
        <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg max-w-md text-center">
          <div className="text-red-500 dark:text-red-400 mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-1">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );

  // For initial server render, use a default non-dark appearance
  if (!isClient) {
    return (
      <div className="w-full">
        <Header />
        <div className="min-h-screen py-10 px-4 md:px-8 w-full transition-colors duration-200 bg-gray-50 text-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Settings</h1>
              <Button
                className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                disabled={true}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
            {/* Minimal content for server rendering */}
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
            </div>
          </div>
        </div>
        <Footer isDarkMode={false} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header />
      <div
        className={`min-h-screen py-10 px-4 md:px-8 w-full transition-colors duration-200 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Button
              onClick={handleSave}
              className={`
                flex items-center gap-2 
                ${darkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>

          {settings.savedSuccess && (
            <Alert
              className={`mb-6 border-l-4 border-l-green-500 ${
                darkMode
                  ? "bg-green-800/30 border border-green-700 text-white"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 text-green-500">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0C4.5 0 0 4.5 0 10C0 15.5 4.5 20 10 20C15.5 20 20 15.5 20 10C20 4.5 15.5 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <AlertTitle className="text-lg font-medium">
                    Success!
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    Your settings have been saved successfully.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <Card
            className={`mb-6 overflow-hidden shadow-md transition-all ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white hover:shadow-lg hover:shadow-blue-900/10"
                : "bg-white hover:shadow-lg"
            }`}
          >
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-500" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Toggle dark mode appearance
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={() => handleToggle("darkMode")}
                  className={darkMode ? "bg-blue-600" : ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`mb-6 overflow-hidden shadow-md transition-all ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white hover:shadow-lg hover:shadow-blue-900/10"
                : "bg-white hover:shadow-lg"
            }`}
          >
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell
                  className={`h-5 w-5 ${
                    darkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4 divide-y divide-gray-100 dark:divide-gray-700">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                  className={
                    settings.emailNotifications && darkMode ? "bg-blue-600" : ""
                  }
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Receive updates via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={() => handleToggle("smsNotifications")}
                  className={
                    settings.smsNotifications && darkMode ? "bg-blue-600" : ""
                  }
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Donation Reminders</p>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Get reminded when you&apos;re eligible to donate
                  </p>
                </div>
                <Switch
                  checked={settings.donationReminders}
                  onCheckedChange={() => handleToggle("donationReminders")}
                  className={
                    settings.donationReminders && darkMode ? "bg-blue-600" : ""
                  }
                />
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Blood Shortage Alerts</p>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Be notified of urgent blood needs
                  </p>
                </div>
                <Switch
                  checked={settings.bloodShortageAlerts}
                  onCheckedChange={() => handleToggle("bloodShortageAlerts")}
                  className={
                    settings.bloodShortageAlerts && darkMode
                      ? "bg-blue-600"
                      : ""
                  }
                />
              </div>
            </CardContent>
            <CardFooter
              className={`py-3 px-6 bg-gray-50 ${
                darkMode
                  ? "bg-gray-750 border-t border-gray-700"
                  : "border-t border-gray-100"
              }`}
            >
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Info className="h-4 w-4 mr-2" />
                Manage how and when you receive notifications
              </div>
            </CardFooter>
          </Card>

          <Card
            className={`mb-6 overflow-hidden shadow-md transition-all ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white hover:shadow-lg hover:shadow-blue-900/10"
                : "bg-white hover:shadow-lg"
            }`}
          >
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe
                  className={`h-5 w-5 ${
                    darkMode ? "text-green-400" : "text-green-500"
                  }`}
                />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <select
                className={`w-full p-3 rounded-lg border transition-colors focus:ring-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-600 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                }`}
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="english">English</option>
                <option value="sinhala">Sinhala</option>
                <option value="tamil">Tamil</option>
              </select>
            </CardContent>
            <CardFooter
              className={`py-3 px-6 bg-gray-50 ${
                darkMode
                  ? "bg-gray-750 border-t border-gray-700"
                  : "border-t border-gray-100"
              }`}
            >
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Info className="h-4 w-4 mr-2" />
                Change the language for the entire application
              </div>
            </CardFooter>
          </Card>

          <div className="sticky bottom-4 left-0 right-0 flex justify-center md:justify-end mt-8">
            <Button
              onClick={handleSave}
              className={`
                flex items-center gap-2 shadow-lg px-6 py-2 transition-all
                ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }
                ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      <Footer isDarkMode={darkMode} />
    </div>
  );
};

export default DonorSettings;
