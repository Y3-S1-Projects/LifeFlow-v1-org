import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  Droplet,
  Award,
  Clock,
  MapPin,
  AlertCircle,
  User,
  Clipboard,
} from "lucide-react";
import Header from "../components/Header";
import useUser from "../hooks/useUser";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import Loader from "../components/Loader";
import Modal2 from "../components/Modal2";

interface Donation {
  date: string;
  location: string;
  bloodType: string;
  volume: string;
}

const DonorDashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [toastShown, setToastShown] = useState(false);
  const toastShownRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const message = searchParams.get("message");
    // Only show if we have a message and haven't shown it yet
    if (message && !toastShown) {
      // Single timeout to handle the toast
      const timer = setTimeout(() => {
        toast.success(message);
        toastShownRef.current = true;
        router.replace("/donor-dashboard");
        setToastShown(true);
      }, 500);

      // Cleanup function to prevent memory leaks
      return () => clearTimeout(timer);
    }
  }, [searchParams, toastShown]);

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  const handleEligibilityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setIsModalOpen(true); // Open the modal

    const dataToSubmit = { isEligible: true };

    try {
      // Simulate a delay before making the API call
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

      const response = await fetch(
        `http://localhost:3001/users/updateUser/${user?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (response.ok) {
        // Simulate a delay before redirecting
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

        router.push(
          "/donor-dashboard?message=" +
            encodeURIComponent("You are now eligible for more features")
        );
        console.log("Eligibility status updated");
        window.location.reload();
      } else {
        console.error("Failed to update eligibility status");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsLoading(false); // Stop loading
      setIsModalOpen(false); // Close the modal
    }
  };

  // Default Values
  const donationHistory: Donation[] = [
    {
      date: "2025-01-15",
      location: "Central Blood Bank",
      bloodType: "O+",
      volume: "450ml",
    },
    {
      date: "2024-10-03",
      location: "LifeFlow Mobile Unit",
      bloodType: "O+",
      volume: "450ml",
    },
    {
      date: "2024-07-22",
      location: "City Hospital",
      bloodType: "O+",
      volume: "450ml",
    },
  ];

  const totalDonations = donationHistory.length;
  const impactLives = totalDonations * 3;
  const nextEligibleDate = "2025-04-15";

  const customNavigate = (path: string) => {
    window.location.href = path;
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="min-h-screen p-6 w-screen mx-auto space-y-6 flex flex-col">
      <Header />
      <Toaster
        toastOptions={{
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />

      {/* 3D Card Style Eligibility Message */}
      {/* {!user?.isEligible && isVisible && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 relative">
          <div className="flex items-center">
            <div className="flex-grow">
              <p className="font-bold mb-1">
                You are Not Eligible to Donate Blood
              </p>
              <p className="text-sm">
                Complete your profile to become eligible
              </p>
            </div>
            <div className="flex items-center">
              <button className="mr-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                Complete
              </button>
              <button
                onClick={handleClose}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )} */}
      {user?.isEligible === false && isVisible && (
        <div
          className={`rounded-lg p-6 shadow-md ${
            user?.isAssessmentCompleted && user?.isProfileComplete
              ? "bg-gradient-to-r from-green-100 to-green-50" // Green gradient for "all setup"
              : "bg-gradient-to-r from-red-100 to-red-50" // Red gradient for "not eligible"
          }`}
        >
          <div className="flex items-center justify-between">
            {user?.isAssessmentCompleted && user?.isProfileComplete ? (
              <>
                <div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">
                    Welcome, {user?.firstName || "New Donor"}
                  </h1>
                  <p className="text-green-600">You are all set up!</p>
                </div>
                <Button
                  variant={"default"}
                  onClick={handleEligibilityUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ClipLoader size={20} color={"#ffffff"} /> // Spinner inside the button
                  ) : (
                    "Start my journey"
                  )}
                </Button>
                <Modal2
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%", // Ensure the container takes full height of the modal
                    }}
                  >
                    <Loader /> {/* Spinner */}
                    <p style={{ marginTop: "10px" }}>
                      Setting up your profile...
                    </p>
                  </div>
                </Modal2>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold text-red-800 mb-2">
                    Welcome, {user?.firstName || "New Donor"}
                  </h1>
                  <p className="text-red-600">
                    You're not yet eligible to donate. Let's get you started!
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-red-600" />
              </>
            )}
          </div>
        </div>
      )}

      {user?.isEligible === false && isVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clipboard className="mr-2 text-red-600" />
              Donation Eligibility Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="mr-3 text-gray-500" />
                <div>
                  <h3 className="font-semibold">Complete Personal Profile</h3>
                  <p className="text-sm text-gray-600">
                    Ensure all required information is filled out
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    user?.isProfileComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
                  >
                    {user?.isProfileComplete ? "Completed" : "Incomplete"}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <Droplet className="mr-3 text-gray-500" />
                <div>
                  <h3 className="font-semibold">Self-Assessment</h3>
                  <p className="text-sm text-gray-600">
                    Complete an online questionnaire to assess donation
                    eligibility
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${
                      user?.isAssessmentCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}
                  >
                    {user?.isAssessmentCompleted ? "Completed" : "Incomplete"}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="mr-3 text-gray-500" />
                <div>
                  <h3 className="font-semibold">Age and Weight Requirements</h3>
                  <p className="text-sm text-gray-600">
                    Must be 18-65 years old and meet weight criteria
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    user?.isProfileComplete
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
                  >
                    {user?.isProfileComplete ? "Qualified" : "Not Qualified"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.isEligible === false && isVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps to Become a Donor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Update Your Profile Section */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  1. Update Your Profile
                </h3>
                <p className="text-sm text-blue-700">
                  Complete all required fields in your donor profile to start
                  your journey.
                </p>
                <button
                  className={`mt-2 px-4 py-2 rounded text-sm flex items-center gap-2 ${
                    user?.isProfileComplete
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={() => {
                    if (!user?.isProfileComplete) {
                      customNavigate("/eligibility-form");
                    }
                  }}
                  disabled={user?.isProfileComplete}
                >
                  {user?.isProfileComplete ? (
                    <>
                      <span>Profile Completed</span>
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </div>

              {/* Complete Self-Assessment Section */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  2. Complete Self-Assessment
                </h3>
                <p className="text-sm text-blue-700">
                  Fill out a short online questionnaire to assess your
                  eligibility for donation.
                </p>
                <button
                  className={`mt-2 px-4 py-2 rounded text-sm flex items-center gap-2 ${
                    user?.isAssessmentCompleted
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={() => {
                    if (!user?.isAssessmentCompleted) {
                      customNavigate("/self-assessment");
                    }
                  }}
                  disabled={user?.isAssessmentCompleted}
                >
                  {user?.isAssessmentCompleted ? (
                    <>
                      <span>Assessment Completed</span>
                    </>
                  ) : (
                    "Start Assessment"
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user?.isEligible && (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-600">
            Good Morning {user?.firstName || "Donor"}
          </h1>
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-600" />
            <span className="font-medium">
              Blood Type: {user?.bloodType || "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {user?.isEligible && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donations
              </CardTitle>
              <Droplet className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDonations}</div>
              <p className="text-xs text-muted-foreground">Donations made</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Lives Impacted
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{impactLives}</div>
              <p className="text-xs text-muted-foreground">People helped</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Next Eligible Date
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nextEligibleDate}</div>
              <p className="text-xs text-muted-foreground">
                Mark your calendar
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Donation History */}
      {user?.isEligible && (
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationHistory.map((donation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Droplet className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{donation.location}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{donation.date}</span>
                        <MapPin className="h-4 w-4 ml-2" />
                        <span>{donation.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{donation.bloodType}</p>
                    <p className="text-sm text-gray-500">{donation.volume}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Footer isDarkMode={false} />
    </div>
  );
};

export default DonorDashboard;
