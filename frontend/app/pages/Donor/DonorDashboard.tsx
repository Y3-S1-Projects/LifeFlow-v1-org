import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  Droplet,
  Award,
  MapPin,
  User,
  Clipboard,
  Heart,
  Users,
  Badge,
  TrendingUp,
  Droplets,
  ArrowRight,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Header from "../../components/Header";
import useUser from "../../hooks/useUser";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { Button } from "@/components/ui/button";
import Loader from "../../components/Loader";
import { RouteGuard } from "../../components/RouteGuard";
import { useDarkMode } from "@/app/contexts/DarkModeContext";
import BloodDonationChatbot from "@/app/components/ChatBot";
import axios from "axios";

interface Settings {
  darkMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  donationReminders: boolean;
  bloodShortageAlerts: boolean;
  language: string;
  savedSuccess: boolean;
}

interface Donation {
  donationDate: string;
  donationCenter: {
    name: string;
    address:
      | {
          street: string;
          city: string;
          postalCode: string;
        }
      | string;
    contact: string;
  };
  donationType: string;
  pintsDonated: number;
}

interface SearchParamsHandlerProps {
  onMessageFound: (message: string) => void;
}

const SearchParamsHandler = ({ onMessageFound }: SearchParamsHandlerProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toastShown, setToastShown] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message && !toastShown) {
      const timer = setTimeout(() => {
        toast.success(message);
        toastShownRef.current = true;
        router.replace("/donor/dashboard");
        setToastShown(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, toastShown, router]);

  return null;
};

const DonorDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const [isVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsModalOpen] = useState(false);
  const { darkMode } = useDarkMode();
  // const [csrfToken, setCsrfToken] = useState<string>("");
  const [, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    donationReminders: true,
    bloodShortageAlerts: true,
    language: "english",
    savedSuccess: false,
  });
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [, setHistoryLoading] = useState(true);
  const [, setHistoryError] = useState<string | null>(null);
  const [, setNextEligibleDate] = useState<string>("Loading...");
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://lifeflow-v1-org-production.up.railway.app"
      : "http://localhost:3001";
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // useEffect(() => {
  //   const message = searchParams.get("message");
  //   if (message && !toastShown) {
  //     const timer = setTimeout(() => {
  //       toast.success(message);
  //       toastShownRef.current = true;
  //       router.replace("/donor/dashboard");
  //       setToastShown(true);
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [searchParams, toastShown]);

  // useEffect(() => {
  //   const fetchCsrfToken = async (): Promise<void> => {
  //     try {
  //       const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
  //         withCredentials: true,
  //       });
  //       setCsrfToken(data.csrfToken);
  //       axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
  //     } catch (err) {
  //       console.error("CSRF token fetch error:", err);
  //       toast.error("Failed to fetch security token");
  //     }
  //   };

  //   fetchCsrfToken();
  // }, [API_BASE_URL]);

  useEffect(() => {
    if (user && user.isEligible) {
      fetchDonationHistory();
    }
  }, [user]);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      darkMode,
    }));
  }, [darkMode]);

  useEffect(() => {
    if (donationHistory.length > 0) {
      const sortedDonations = [...donationHistory].sort((a, b) => {
        const dateA = new Date(a.donationDate).getTime();
        const dateB = new Date(b.donationDate).getTime();
        return dateB - dateA; // Sort by newest first (descending)
      });
      setDonationHistory(sortedDonations);
    }
  }, [donationHistory.length]); // Only re-run if the number of donations changes
  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  const calculateNextEligibleDate = (donations: Donation[]) => {
    if (!donations || donations.length === 0) return "Eligible now";

    // Sort donations by date (newest first)
    const sortedDonations = [...donations].sort((a, b) => {
      return (
        new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
      );
    });

    const lastDonationDate = new Date(sortedDonations[0].donationDate);
    const waitPeriod = 56; // 56 days is typical minimum between whole blood donations

    const eligibleDate = new Date(lastDonationDate);
    eligibleDate.setDate(lastDonationDate.getDate() + waitPeriod);

    const today = new Date();

    if (today >= eligibleDate) {
      return "Eligible now";
    } else {
      return formatDate(eligibleDate);
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const handleScheduleDonation = () => {
    router.push("/donor/appointments");
  };

  const daysSince = (dateString: string) => {
    const donationDate = new Date(dateString).getTime();
    const today = new Date().getTime();
    const diffTime = Math.abs(today - donationDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const isEligibleForNext = (dateString: string) => {
    const donationDate = new Date(dateString).getTime();
    const today = new Date().getTime();
    const diffTime = Math.abs(today - donationDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days >= 56;
  };

  const fetchDonationHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${publicApi}/users/donation-history`, {
        credentials: "include", // Send cookies with request
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donation history");
      }

      const data = await response.json();

      if (data && data.donationHistory && Array.isArray(data.donationHistory)) {
        setDonationHistory(data.donationHistory);
      } else {
        setDonationHistory([]);
      }

      if (data.nextEligibleDate) {
        setNextEligibleDate(data.nextEligibleDate);
      } else {
        setNextEligibleDate("Eligible now");
      }
    } catch (err) {
      console.error("Error fetching donation history:", err);
      setHistoryError((err as Error).message);
      setDonationHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEligibilityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsModalOpen(true);

    const dataToSubmit = { isEligible: true };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const csrfResponse = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
        withCredentials: true,
      });
      const csrfToken = csrfResponse.data.csrfToken;
      const response = await fetch(
        `${publicApi}/users/updateUser/${user?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include", // Add this line
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        router.push(
          "/donor/dashboard?message=" +
            encodeURIComponent("You are now eligible for more features")
        );
        window.location.reload();
      } else {
        console.error("Failed to update eligibility status");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      console.log("Eligibility update process completed");
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const totalDonations = donationHistory.length;
  const impactLives = totalDonations * 3;

  const customNavigate = (path: string) => {
    window.location.href = path;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Happy Late Night";
  };

  return (
    <RouteGuard requiredRoles={["User"]}>
      <SearchParamsHandler onMessageFound={(message) => {}} />
      <div className={`w-full ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <Header />
        <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4 mx-auto space-y-6 flex flex-col">
          <Toaster
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
            }}
          />

          <BloodDonationChatbot />

          {/* User Status Card */}
          {user?.isEligible === false && isVisible && (
            <Card className="mb-8 shadow-md border-0 overflow-hidden">
              <div
                className={`p-6 ${
                  user?.isAssessmentCompleted && user?.isProfileComplete
                    ? "bg-gradient-to-r from-green-500 to-green-400 text-white"
                    : "bg-gradient-to-r from-amber-500 to-amber-400 text-white"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Welcome, {user?.firstName || "New Donor"}
                    </h1>
                    <p className="text-lg">
                      {user?.isAssessmentCompleted && user?.isProfileComplete
                        ? "You are all set up and ready to donate!"
                        : "Complete your profile to begin your donation journey"}
                    </p>
                  </div>
                  {user?.isAssessmentCompleted && user?.isProfileComplete ? (
                    <Button
                      className="bg-white text-green-600 hover:bg-gray-100 hover:text-green-700 font-semibold"
                      onClick={handleEligibilityUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Start My Journey"}
                    </Button>
                  ) : (
                    <div className="flex items-center text-white bg-amber-600 px-4 py-2 rounded-lg">
                      <XCircle className="h-6 w-6 mr-2" />
                      <span>Profile Incomplete</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Main Content - Two Column Layout on Larger Screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Eligibility Checklist */}
            {user?.isEligible === false && isVisible && (
              <Card className="shadow-md border-0 h-full">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center text-gray-800">
                    <Clipboard className="mr-3 text-red-600" />
                    Donation Eligibility Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Profile Completion Status */}
                    <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 bg-red-100 p-3 rounded-full mb-4 md:mb-0">
                        <User className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">
                          Complete Personal Profile
                        </h3>
                        <p className="text-sm text-gray-600">
                          Ensure all required personal information is filled out
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {user?.isProfileComplete ? (
                          <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </span>
                        ) : (
                          <span className="flex items-center text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                            <XCircle className="h-4 w-4 mr-1" />
                            Incomplete
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Self-Assessment Status */}
                    <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 bg-red-100 p-3 rounded-full mb-4 md:mb-0">
                        <Droplet className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">
                          Health Self-Assessment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Complete a short questionnaire about your health
                          history
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {user?.isAssessmentCompleted ? (
                          <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </span>
                        ) : (
                          <span className="flex items-center text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                            <XCircle className="h-4 w-4 mr-1" />
                            Incomplete
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Age and Weight Requirements */}
                    <div className="flex items-start md:items-center flex-col md:flex-row md:gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 bg-red-100 p-3 rounded-full mb-4 md:mb-0">
                        <Calendar className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">
                          Age and Weight Requirements
                        </h3>
                        <p className="text-sm text-gray-600">
                          Must be 18-65 years old and meet minimum weight
                          criteria
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        {user?.isProfileComplete ? (
                          <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Qualified
                          </span>
                        ) : (
                          <span className="flex items-center text-sm font-medium text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                            <XCircle className="h-4 w-4 mr-1" />
                            Verify
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {user?.isEligible === false && isVisible && (
              <Card className="shadow-md border-0 h-full">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-gray-800">
                    Next Steps to Become a Donor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Update Profile Step */}
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                      <div className="bg-red-50 p-4 border-l-4 border-red-500">
                        <div className="flex items-center mb-2">
                          <div className="bg-red-100 text-red-600 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            1
                          </div>
                          <h3 className="font-semibold text-gray-800">
                            Update Your Profile
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700 pl-11 mb-4">
                          Complete all required fields in your donor profile
                          including personal information and contact details.
                        </p>
                        <div className="pl-11">
                          <Button
                            className={`flex items-center ${
                              user?.isProfileComplete
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                            onClick={() => {
                              if (!user?.isProfileComplete) {
                                customNavigate("/donor/eligibility-form");
                              }
                            }}
                            disabled={user?.isProfileComplete}
                          >
                            {user?.isProfileComplete ? (
                              <>Profile Completed</>
                            ) : (
                              <>
                                Complete Profile
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Self-Assessment Step */}
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
                      <div className="bg-red-50 p-4 border-l-4 border-red-500">
                        <div className="flex items-center mb-2">
                          <div className="bg-red-100 text-red-600 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            2
                          </div>
                          <h3 className="font-semibold text-gray-800">
                            Complete Health Assessment
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700 pl-11 mb-4">
                          Answer a few health-related questions to determine
                          your eligibility to donate blood safely.
                        </p>
                        <div className="pl-11">
                          <Button
                            className={`flex items-center ${
                              user?.isAssessmentCompleted
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                            onClick={() => {
                              if (!user?.isAssessmentCompleted) {
                                customNavigate("/donor/self-assessment");
                              }
                            }}
                            disabled={user?.isAssessmentCompleted}
                          >
                            {user?.isAssessmentCompleted ? (
                              <>Assessment Completed</>
                            ) : (
                              <>
                                Start Assessment
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4">
                  <div className="w-full text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Need help with your application?
                    </p>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Contact Support
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
          {user?.isEligible && (
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-red-600">
                {getGreeting()}, {user?.firstName || "Donor"}
              </h1>
              <div className="flex items-center space-x-2">
                <Droplets className="text-red-600" />
                <span className="font-medium">
                  Blood Type:{" "}
                  {user?.bloodType && user.bloodType !== "not sure"
                    ? user.bloodType
                    : "Not set"}
                </span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {user?.isEligible && (
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ${
                darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-100"
              }`}
            >
              <Card className="shadow-lg overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle
                    className={`text-sm font-medium ${
                      darkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Total Donations
                  </CardTitle>
                  <div className="p-2  rounded-full">
                    <Droplet className="h-4 w-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {totalDonations}
                  </div>
                  <div className="flex items-center mt-1">
                    <p
                      className={`text-xs ${
                        darkMode ? "text-white" : "text-gray-700"
                      }`}
                    >
                      Donations made
                    </p>
                    {totalDonations > 0 && (
                      <Badge className="ml-2   text-xs">Hero</Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      <span>
                        {totalDonations > 0
                          ? `${Math.min(
                              totalDonations * 10,
                              100
                            )}% toward next milestone`
                          : "Start your journey today"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium ">
                    Lives Impacted
                  </CardTitle>
                  <div className="p-2  rounded-full">
                    <Award className="h-4 w-4 " />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold ">{impactLives}</div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs ">People helped</p>
                    {impactLives >= 3 && (
                      <Badge className="ml-2 bg-yellow-50   text-xs">
                        {impactLives > 20 ? "Community Hero" : "Life Champion"}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="">Impact multiplier:</span>
                      <span className="font-medium ">3x per donation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium ">
                    Next Eligible Date
                  </CardTitle>
                  <div className="p-2 rounded-full">
                    <Calendar className="h-4 w-4 " />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold ">
                    {calculateNextEligibleDate(donationHistory)}
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs ">Mark your calendar</p>
                    {calculateNextEligibleDate(donationHistory) ===
                    "Eligible now" ? (
                      <Badge className="ml-2  text-green-700 border-green-200 text-xs">
                        Eligible now!
                      </Badge>
                    ) : (
                      <Badge className="ml-2  text-blue-700 border-blue-200 text-xs">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full text-xs    flex items-center justify-center ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      }`}
                      onClick={handleScheduleDonation}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule next donation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Donation History */}
          {user?.isEligible && (
            <Card
              className={` shadow-xl rounded-xl overflow-hidden border ${
                darkMode ? "bg-black text-white" : "bg-gray-50 text-gray-900"
              }`}
            >
              <CardHeader
                className={` p-6 ${
                  darkMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={` p-2 rounded-full ${
                        darkMode ? "bg-black" : "bg-red-500"
                      }`}
                    >
                      <Droplet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Your Donation Journey
                      </CardTitle>
                      <p className="text-sm mt-1">
                        Thank you for your lifesaving contributions
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 p-2 rounded-lg">
                    <Heart
                      className={`h-5 w-5 ${
                        darkMode ? "bg-black" : "text-red-500"
                      }`}
                    />
                    <span className="font-bold ">
                      {donationHistory.reduce(
                        (sum, d) => sum + Math.round(d.pintsDonated * 3),
                        0
                      )}{" "}
                      lives impacted
                    </span>
                  </div>
                </div>
              </CardHeader>
              <div className="border-t border-gray-400"></div>

              <CardContent className="p-6">
                {donationHistory.length === 0 ? (
                  <div className="text-center py-12  rounded-xl border border-dashed border-gray-200">
                    <Droplet className="h-12 w-12  mx-auto mb-3" />
                    <p className=" font-medium mb-2">
                      No donations recorded yet
                    </p>
                    <p className="text-sm  max-w-md mx-auto mb-4">
                      Your donation journey will appear here once you make your
                      first contribution
                    </p>
                    <Button
                      className={`${
                        darkMode ? "hover:bg-gray-400" : "hover:bg-gray-600s"
                      }`}
                      onClick={handleScheduleDonation}
                    >
                      Schedule Your First Donation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium ">Your donation timeline</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Only show the first 2 donations */}
                      {donationHistory
                        .sort(
                          (a, b) =>
                            new Date(b.donationDate).getTime() -
                            new Date(a.donationDate).getTime()
                        )
                        .slice(0, 2)
                        .map((donation, index) => {
                          return (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row items-start gap-4  rounded-xl p-4 border  hover:border-red-200 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-center  rounded-full h-16 w-16 flex-shrink-0">
                                <Droplet className="h-8 w-8 text-red-600" />
                              </div>

                              <div className="space-y-2 flex-grow">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-lg ">
                                      {donation.donationType}
                                    </p>
                                    <p className="text-red-800">
                                      {donation.donationCenter.name}
                                    </p>
                                  </div>
                                  <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                                    {donation.pintsDonated} pint
                                    {donation.pintsDonated !== 1 ? "s" : ""}
                                  </Badge>
                                </div>

                                <div className="flex flex-col space-y-1 text-sm">
                                  <div className="flex items-center ">
                                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="font-medium">
                                      {formatDate(donation.donationDate)}
                                    </span>
                                    <span className="ml-2 ">
                                      ({daysSince(donation.donationDate)})
                                    </span>
                                  </div>
                                  <div className="flex items-center ">
                                    <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                    <span>
                                      {typeof donation.donationCenter
                                        .address === "string"
                                        ? donation.donationCenter.address
                                        : `${
                                            donation.donationCenter.address
                                              .street
                                          }, ${
                                            donation.donationCenter.address.city
                                          }${
                                            donation.donationCenter.address
                                              .postalCode
                                              ? ", " +
                                                donation.donationCenter.address
                                                  .postalCode
                                              : ""
                                          }`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                  <div className="text-sm text-green-600 flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>
                                      Impact: ~
                                      {Math.round(donation.pintsDonated * 3)}{" "}
                                      lives
                                    </span>
                                  </div>

                                  {isEligibleForNext(donation.donationDate) &&
                                    index === 0 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                                        onClick={handleScheduleDonation}
                                      >
                                        Donate again
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* See All Button - only show if there are more than 2 donations */}
                      {donationHistory.length > 2 && (
                        <div className="text-center mt-4">
                          <Button
                            variant="outline"
                            className={`w-full border-red-200  hover:bg-red-50 ${
                              darkMode
                                ? "hover:bg-gray-800"
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => router.push("/donor/donations")}
                          >
                            See All Donations ({donationHistory.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="px-6 py-4  border-t flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 " />
                  <p className="text-sm ">
                    Each donation can help save up to{" "}
                    <span className="font-semibold">3 lives</span>
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end">
                  <p className="text-sm text-gray-600 mr-2 md:mr-0">
                    Your total impact:
                  </p>
                  <p className="font-bold text-xl text-red-600">
                    {donationHistory.reduce(
                      (sum, d) => sum + Math.round(d.pintsDonated * 3),
                      0
                    )}{" "}
                    lives saved
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
        <Footer isDarkMode={darkMode} />
      </div>
    </RouteGuard>
  );
};

export default DonorDashboard;
