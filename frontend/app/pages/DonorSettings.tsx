import React, { useState } from "react";
import { Save, Bell, Moon, Sun, Globe, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useDarkMode } from "../contexts/DarkModeContext";

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
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    donationReminders: true,
    bloodShortageAlerts: true,
    language: "english",
    savedSuccess: false,
  });

  const handleToggle = (setting: SettingKey) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = () => {
    setSettings((prev) => ({
      ...prev,
      savedSuccess: true,
    }));

    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        savedSuccess: false,
      }));
    }, 3000);
  };

  return (
    <div
      className={`min-h-screen p-8 w-screen
         ${
           settings.darkMode
             ? "bg-gray-900 text-white"
             : "bg-gray-50 text-gray-900"
         }`}
    >
      <Header />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Card
          className={`mb-6 ${
            settings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">
                  Toggle dark mode appearance
                </p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`mb-6 ${
            settings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via SMS</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={() => handleToggle("smsNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Donation Reminders</p>
                <p className="text-sm text-gray-500">
                  Get reminded when you're eligible to donate
                </p>
              </div>
              <Switch
                checked={settings.donationReminders}
                onCheckedChange={() => handleToggle("donationReminders")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Blood Shortage Alerts</p>
                <p className="text-sm text-gray-500">
                  Be notified of urgent blood needs
                </p>
              </div>
              <Switch
                checked={settings.bloodShortageAlerts}
                onCheckedChange={() => handleToggle("bloodShortageAlerts")}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`mb-6 ${
            settings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className={`w-full p-2 rounded-md border ${
                settings.darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              value={settings.language}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, language: e.target.value }))
              }
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
            </select>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {settings.savedSuccess && (
          <Alert className="mt-4 bg-green-100 border-green-200">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your settings have been saved successfully.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Footer isDarkMode={settings.darkMode} />
    </div>
  );
};

export default DonorSettings;
