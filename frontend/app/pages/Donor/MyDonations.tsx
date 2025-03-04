"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Droplet,
  Calendar,
  MapPin,
  Users,
  Heart,
  Award,
  BarChart,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { getUserIdFromToken } from "@/app/utils/auth";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { RouteGuard } from "@/app/components/RouteGuard";

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

interface DonationStats {
  totalDonations: number;
  totalPints: number;
  livesImpacted: number;
  firstDonation: string | null;
  mostRecentDonation: string | null;
}

const MyDonationsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toastShown, setToastShown] = useState(false);
  const toastShownRef = useRef(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [nextEligibleDate, setNextEligibleDate] =
    useState<string>("Loading...");
  const [donationStats, setDonationStats] = useState<DonationStats>({
    totalDonations: 0,
    totalPints: 0,
    livesImpacted: 0,
    firstDonation: null,
    mostRecentDonation: null,
  });

  // Handle success messages from redirects
  useEffect(() => {
    const message = searchParams.get("message");
    if (message && !toastShown) {
      const timer = setTimeout(() => {
        toast.success(message);
        toastShownRef.current = true;
        router.replace("/donor/my-donations");
        setToastShown(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, toastShown, router]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "User") {
      router.push("/unauthorized");
    } else {
      // Only fetch data if user is authorized
      fetchDonationHistory();
    }
  }, []);

  // Update stats when donation history changes
  useEffect(() => {
    if (donationHistory.length > 0) {
      calculateDonationStats();
    }
  }, [donationHistory]);

  // Sort donations when sort order changes
  useEffect(() => {
    if (donationHistory.length > 0) {
      sortDonations(sortOrder);
    }
  }, [sortOrder]);

  const fetchDonationHistory = async () => {
    setHistoryLoading(true);
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await fetch(
        `http://localhost:3001/users/donation-history/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donation history");
      }

      const data = await response.json();

      if (data && data.donationHistory && Array.isArray(data.donationHistory)) {
        setDonationHistory(data.donationHistory);
        sortDonations("newest", data.donationHistory);
      } else {
        console.warn("Invalid donation history structure:", data);
        setDonationHistory([]);
      }

      // Set next eligible date
      setNextEligibleDate(calculateNextEligibleDate(data.donationHistory));
    } catch (err) {
      console.error("Error fetching donation history:", err);
      setHistoryError((err as Error).message);
      setDonationHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sortDonations = (order: string, donations = donationHistory) => {
    const sortedDonations = [...donations].sort((a, b) => {
      const dateA = new Date(a.donationDate).getTime();
      const dateB = new Date(b.donationDate).getTime();
      return order === "newest" ? dateB - dateA : dateA - dateB;
    });
    setDonationHistory(sortedDonations);
  };

  const calculateDonationStats = () => {
    const totalDonations = donationHistory.length;
    const totalPints = donationHistory.reduce(
      (sum, donation) => sum + donation.pintsDonated,
      0
    );
    const livesImpacted = totalPints * 3; // Assuming 1 pint helps 3 people

    // Find first and most recent donation dates
    const sortedByDate = [...donationHistory].sort((a, b) => {
      return (
        new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime()
      );
    });

    const firstDonation =
      sortedByDate.length > 0 ? sortedByDate[0].donationDate : null;
    const mostRecentDonation =
      sortedByDate.length > 0
        ? sortedByDate[sortedByDate.length - 1].donationDate
        : null;

    setDonationStats({
      totalDonations,
      totalPints,
      livesImpacted,
      firstDonation,
      mostRecentDonation,
    });
  };

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

  // Helper functions for date and time
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
    return days >= 56; // 56 days is typical minimum between whole blood donations
  };

  // Handle scheduling a new donation
  const handleScheduleDonation = () => {
    router.push("/donor/appointments");
  };

  return (
    <RouteGuard requiredRoles={["User"]}>
      <div className="w-full">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Donations
              </h1>
              <p className="text-gray-600">
                Track your donation history and see the impact you've made
              </p>
            </div>

            <Button
              onClick={handleScheduleDonation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Schedule New Donation
            </Button>
          </div>

          {historyLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          ) : historyError ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-medium mb-2">
                Error loading your donation history
              </p>
              <p className="text-sm text-red-500 max-w-md mx-auto mb-4">
                {historyError}
              </p>
              <Button
                onClick={fetchDonationHistory}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Donation Stats Cards */}
              {donationHistory.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Total Donations
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {donationStats.totalDonations}
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-full">
                          <Droplet className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Total Pints
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {donationStats.totalPints}
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-full">
                          <BarChart className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Lives Impacted
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {donationStats.livesImpacted}
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-full">
                          <Users className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            Next Eligible
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {nextEligibleDate}
                          </p>
                        </div>
                        <div className="bg-red-100 p-2 rounded-full">
                          <Clock className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Donation Timeline Card */}
              <Card className="shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-gray-800">
                    Your Donation Journey
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {donationHistory.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium mb-2">
                        No donations recorded yet
                      </p>
                      <p className="text-sm text-gray-400 max-w-md mx-auto mb-4">
                        Your donation journey will appear here once you make
                        your first contribution
                      </p>
                      <Button
                        onClick={handleScheduleDonation}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Schedule Your First Donation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-700">
                          Your donation timeline
                        </h3>
                        <Select
                          defaultValue={sortOrder}
                          onValueChange={(value) => setSortOrder(value)}
                        >
                          <SelectTrigger className="w-32 text-xs">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="h-screen overflow-y-auto">
                        <div className="space-y-4">
                          {donationHistory.map((donation, index) => (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row items-start gap-4 bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-center bg-red-100 rounded-full h-16 w-16 flex-shrink-0">
                                <Droplet className="h-8 w-8 text-red-600" />
                              </div>

                              <div className="space-y-2 flex-grow">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-lg text-gray-800">
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
                                  <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                    <span className="font-medium">
                                      {formatDate(donation.donationDate)}
                                    </span>
                                    <span className="ml-2 text-gray-500">
                                      ({daysSince(donation.donationDate)})
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
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
                                        onClick={handleScheduleDonation}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                                      >
                                        Donate again
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Awards and Recognition Section */}
              {donationHistory.length > 0 && (
                <Card className="mt-8 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-gray-800">
                      Your Achievements
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-4 border border-red-100 flex items-center">
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <Award className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            First Time Donor
                          </p>
                          <p className="text-sm text-gray-500">
                            {donationStats.firstDonation
                              ? `Achieved on ${formatDate(
                                  donationStats.firstDonation
                                )}`
                              : "Not yet achieved"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`bg-gradient-to-r from-red-50 to-white rounded-xl p-4 border border-red-100 flex items-center ${
                          donationStats.totalDonations >= 3 ? "" : "opacity-50"
                        }`}
                      >
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            Regular Donor
                          </p>
                          <p className="text-sm text-gray-500">
                            {donationStats.totalDonations >= 3
                              ? "Achieved by donating 3+ times"
                              : `${donationStats.totalDonations}/3 donations made`}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`bg-gradient-to-r from-red-50 to-white rounded-xl p-4 border border-red-100 flex items-center ${
                          donationStats.totalPints >= 10 ? "" : "opacity-50"
                        }`}
                      >
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <Award className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            Silver Donor
                          </p>
                          <p className="text-sm text-gray-500">
                            {donationStats.totalPints >= 10
                              ? "Achieved by donating 10+ pints"
                              : `${donationStats.totalPints}/10 pints donated`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => router.push("/donor/achievements")}
                      >
                        View all achievements
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </RouteGuard>
  );
};

export default MyDonationsPage;
