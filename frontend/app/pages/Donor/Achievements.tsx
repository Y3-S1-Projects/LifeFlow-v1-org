"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Heart,
  Calendar,
  Droplet,
  Users,
  Clock,
  Medal,
  Star,
  Trophy,
  Zap,
  MapPin,
  Share2,
  UserPlus,
  Badge,
} from "lucide-react";
import { getUserIdFromToken, isAuthenticated } from "@/app/utils/auth";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "milestone" | "impact" | "dedication" | "special";
  requiredValue: number;
  currentValue: number;
  achieved: boolean;
  achievedDate?: string;
  nextLevel?: {
    title: string;
    requiredValue: number;
  };
}

const DonorAchievements: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationHistory, setDonationHistory] = useState<Donation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isDarkMode] = useState(false);
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [achievementStats, setAchievementStats] = useState({
    totalAchieved: 0,
    percentageCompleted: 0,
    nextAchievementName: "",
  });
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/donor/login");
    }
  }, []);

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  useEffect(() => {
    if (donationHistory.length > 0) {
      generateAchievements();
    }
  }, [donationHistory]);

  useEffect(() => {
    if (achievements.length > 0) {
      calculateAchievementStats();
    }
  }, [achievements]);

  const fetchDonationHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${publicApi}/users/donation-history`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch donation history");
      }

      const data = await response.json();

      if (data && data.donationHistory && Array.isArray(data.donationHistory)) {
        setDonationHistory(data.donationHistory);
      } else {
        console.warn("Invalid donation history structure:", data);
        setDonationHistory([]);
      }
    } catch (err) {
      console.error("Error fetching donation history:", err);
      setError((err as Error).message);
      setDonationHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const generateAchievements = () => {
    const totalDonations = donationHistory.length;
    const totalPints = donationHistory.reduce(
      (sum, donation) => sum + donation.pintsDonated,
      0
    );
    const livesImpacted = Math.floor(totalPints * 3); // Calculate with floor applied
    // Sort donations by date
    const sortedByDate = [...donationHistory].sort((a, b) => {
      return (
        new Date(a.donationDate).getTime() - new Date(b.donationDate).getTime()
      );
    });

    const firstDonationDate =
      sortedByDate.length > 0 ? sortedByDate[0].donationDate : null;
    const mostRecentDonation =
      sortedByDate.length > 0
        ? sortedByDate[sortedByDate.length - 1].donationDate
        : null;

    // Calculate donor age in days
    let donorAgeDays = 0;
    if (firstDonationDate) {
      const firstDate = new Date(firstDonationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - firstDate.getTime());
      donorAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if donated in consecutive quarters
    let consecutiveQuarters = 0;
    if (totalDonations >= 4) {
      // This is a simplified implementation - a real one would need to check actual quarters
      consecutiveQuarters = Math.floor(totalDonations / 4);
    }

    // Count unique donation centers
    const uniqueCenters = new Set();
    donationHistory.forEach((donation) => {
      uniqueCenters.add(donation.donationCenter.name);
    });

    // Calculate referrals (this would normally come from your backend)
    const referrals = 0; // Placeholder - would be actual referral count from backend

    // Generate achievement list
    const achievementsList: Achievement[] = [
      // Milestone Achievements
      {
        id: "first-donation",
        title: "First Time Donor",
        description: "Completed your first blood donation",
        icon: <Droplet className="h-8 w-8 text-red-600" />,
        category: "milestone",
        requiredValue: 1,
        currentValue: totalDonations,
        achieved: totalDonations >= 1,
        achievedDate: firstDonationDate
          ? formatDate(firstDonationDate)
          : undefined,
      },
      {
        id: "regular-donor",
        title: "Regular Donor",
        description: "Completed 3 donations",
        icon: <Heart className="h-8 w-8 text-red-600" />,
        category: "milestone",
        requiredValue: 3,
        currentValue: totalDonations,
        achieved: totalDonations >= 3,
        achievedDate:
          totalDonations >= 3 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Committed Donor",
          requiredValue: 5,
        },
      },
      {
        id: "committed-donor",
        title: "Committed Donor",
        description: "Completed 5 donations",
        icon: <Heart className="h-8 w-8 text-red-600" />,
        category: "milestone",
        requiredValue: 5,
        currentValue: totalDonations,
        achieved: totalDonations >= 5,
        achievedDate:
          totalDonations >= 5 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Bronze Donor",
          requiredValue: 10,
        },
      },
      {
        id: "bronze-donor",
        title: "Bronze Donor",
        description: "Completed 10 donations",
        icon: <Medal className="h-8 w-8 text-amber-700" />,
        category: "milestone",
        requiredValue: 10,
        currentValue: totalDonations,
        achieved: totalDonations >= 10,
        achievedDate:
          totalDonations >= 10 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Silver Donor",
          requiredValue: 25,
        },
      },
      {
        id: "silver-donor",
        title: "Silver Donor",
        description: "Completed 25 donations",
        icon: <Medal className="h-8 w-8 text-gray-400" />,
        category: "milestone",
        requiredValue: 25,
        currentValue: totalDonations,
        achieved: totalDonations >= 25,
        achievedDate:
          totalDonations >= 25 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Gold Donor",
          requiredValue: 50,
        },
      },
      {
        id: "gold-donor",
        title: "Gold Donor",
        description: "Completed 50 donations",
        icon: <Medal className="h-8 w-8 text-yellow-500" />,
        category: "milestone",
        requiredValue: 50,
        currentValue: totalDonations,
        achieved: totalDonations >= 50,
        achievedDate:
          totalDonations >= 50 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Platinum Donor",
          requiredValue: 100,
        },
      },

      // Impact Achievements
      {
        id: "lifesaver",
        title: "Lifesaver",
        description: "Helped save your first 3 lives",
        icon: <Users className="h-8 w-8 text-green-600" />,
        category: "impact",
        requiredValue: 3,
        currentValue: livesImpacted,
        achieved: livesImpacted >= 3,
        achievedDate:
          livesImpacted >= 3 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "Community Hero",
          requiredValue: 30,
        },
      },
      {
        id: "community-hero",
        title: "Community Hero",
        description: "Helped save 30 lives through your donations",
        icon: <Users className="h-8 w-8 text-green-600" />,
        category: "impact",
        requiredValue: 30,
        currentValue: livesImpacted,
        achieved: livesImpacted >= 30,
        achievedDate:
          livesImpacted >= 30 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "City Champion",
          requiredValue: 100,
        },
      },
      {
        id: "city-champion",
        title: "City Champion",
        description: "Helped save 100 lives through your donations",
        icon: <Trophy className="h-8 w-8 text-yellow-500" />,
        category: "impact",
        requiredValue: 100,
        currentValue: livesImpacted,
        achieved: livesImpacted >= 100,
        achievedDate:
          livesImpacted >= 100 ? formatDate(mostRecentDonation!) : undefined,
        nextLevel: {
          title: "National Hero",
          requiredValue: 300,
        },
      },

      // Dedication Achievements
      {
        id: "donation-streak",
        title: "Consistent Donor",
        description: "Donated in 4 consecutive quarters",
        icon: <Zap className="h-8 w-8 text-purple-600" />,
        category: "dedication",
        requiredValue: 4,
        currentValue: consecutiveQuarters,
        achieved: consecutiveQuarters >= 1,
        achievedDate:
          consecutiveQuarters >= 1
            ? formatDate(mostRecentDonation!)
            : undefined,
        nextLevel: {
          title: "Donation Veteran",
          requiredValue: 8,
        },
      },
      {
        id: "veteran-donor",
        title: "Veteran Donor",
        description: "Been a donor for over 1 year",
        icon: <Calendar className="h-8 w-8 text-blue-600" />,
        category: "dedication",
        requiredValue: 365,
        currentValue: donorAgeDays,
        achieved: donorAgeDays >= 365,
        achievedDate:
          donorAgeDays >= 365
            ? formatDate(
                new Date(
                  Date.now() - (donorAgeDays - 365) * 24 * 60 * 60 * 1000
                ).toString()
              )
            : undefined,
        nextLevel: {
          title: "Donation Elder",
          requiredValue: 1825, // 5 years
        },
      },
      {
        id: "quick-response",
        title: "Quick Response",
        description: "Donated during an emergency appeal",
        icon: <Clock className="h-8 w-8 text-amber-600" />,
        category: "dedication",
        requiredValue: 1,
        currentValue: 0, // This would need to be tracked in your database
        achieved: false,
      },

      // Special Achievements
      {
        id: "blood-traveler",
        title: "Blood Traveler",
        description: "Donated at 3 different donation centers",
        icon: <MapPin className="h-8 w-8 text-indigo-600" />,
        category: "special",
        requiredValue: 3,
        currentValue: uniqueCenters.size,
        achieved: uniqueCenters.size >= 3,
        achievedDate:
          uniqueCenters.size >= 3 ? formatDate(mostRecentDonation!) : undefined,
      },
      {
        id: "rare-type",
        title: "Rare Type Donor",
        description: "Your blood type is rare and especially valuable",
        icon: <Star className="h-8 w-8 text-yellow-500" />,
        category: "special",
        requiredValue: 1,
        currentValue: 0, // This would need to be tracked in your database
        achieved: false,
      },
      {
        id: "ambassador",
        title: "Blood Ambassador",
        description: "Referred a friend who completed their first donation",
        icon: <UserPlus className="h-8 w-8 text-blue-600" />,
        category: "special",
        requiredValue: 1,
        currentValue: referrals,
        achieved: referrals >= 1,
        nextLevel:
          referrals >= 1
            ? {
                title: "Blood Advocate",
                requiredValue: 5,
              }
            : undefined,
      },
      {
        id: "social-advocate",
        title: "Social Advocate",
        description: "Shared your donation experience on social media",
        icon: <Share2 className="h-8 w-8 text-sky-500" />,
        category: "special",
        requiredValue: 1,
        currentValue: 0, // This would need to be tracked in your database
        achieved: false,
      },
    ];

    setAchievements(achievementsList);
  };

  const calculateAchievementStats = () => {
    const totalAchieved = achievements.filter((a) => a.achieved).length;
    const percentageCompleted = Math.round(
      (totalAchieved / achievements.length) * 100
    );

    // Find next achievement to earn
    let nextAchievementName = "";
    const sortedByProgress = [...achievements]
      .filter((a) => !a.achieved)
      .sort((a, b) => {
        const progressA = a.currentValue / a.requiredValue;
        const progressB = b.currentValue / b.requiredValue;
        return progressB - progressA;
      });

    if (sortedByProgress.length > 0) {
      nextAchievementName = sortedByProgress[0].title;
    }

    setAchievementStats({
      totalAchieved,
      percentageCompleted,
      nextAchievementName,
    });
  };

  const filterAchievements = (category: string) => {
    if (category === "all") {
      return achievements;
    } else if (category === "earned") {
      return achievements.filter((a) => a.achieved);
    } else if (category === "upcoming") {
      return achievements.filter((a) => !a.achieved);
    } else {
      return achievements.filter((a) => a.category === category);
    }
  };

  const calculateProgress = (current: number, required: number) => {
    const progress = Math.min(Math.round((current / required) * 100), 100);
    return progress;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <RouteGuard requiredRoles={["User"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-600 font-medium mb-2">
              Error loading your achievements
            </p>
            <p className="text-sm text-red-500 max-w-md mx-auto mb-4">
              {error}
            </p>
            <Button
              onClick={fetchDonationHistory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredRoles={["User"]}>
      <div className="w-full">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Achievements
              </h1>
              <p className="text-gray-600">
                Track your blood donation milestones and achievements
              </p>
            </div>

            <Button
              onClick={() => router.push("/donor/donations")}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Back to Donations
            </Button>
          </div>

          {/* Achievement Progress Overview */}
          <Card className="mb-8 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Your Achievement Journey
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Progress</span>
                      <span>
                        {achievementStats.totalAchieved} of{" "}
                        {achievements.length} achievements
                      </span>
                    </div>

                    <Progress
                      value={achievementStats.percentageCompleted}
                      className="h-3 bg-gray-100"
                    />

                    <div className="text-sm text-gray-600">
                      {achievementStats.totalAchieved === 0 ? (
                        <p>
                          Start your achievement journey by making your first
                          donation!
                        </p>
                      ) : achievementStats.totalAchieved ===
                        achievements.length ? (
                        <p className="text-green-600 font-medium">
                          Congratulations! You&apos;ve earned all available
                          achievements!
                        </p>
                      ) : (
                        <p>
                          Next achievement:{" "}
                          <span className="text-red-600 font-medium">
                            {achievementStats.nextAchievementName}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 border border-red-100 flex flex-col justify-center items-center">
                  <div className="mb-2">
                    <Trophy className="h-12 w-12 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {achievementStats.totalAchieved}
                  </p>
                  <p className="text-gray-600">Achievements Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Tabs and Cards */}
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6 bg-gray-100 p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="earned"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Earned
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="milestone"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Milestones
              </TabsTrigger>
              <TabsTrigger
                value="impact"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Impact
              </TabsTrigger>
              <TabsTrigger
                value="dedication"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Dedication
              </TabsTrigger>
              <TabsTrigger
                value="special"
                className="data-[state=active]:bg-white data-[state=active]:text-red-600"
              >
                Special
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAchievements(activeTab).map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`hover:shadow-md transition-all border ${
                      achievement.achieved
                        ? "border-green-200 bg-gradient-to-br from-green-50 to-white"
                        : "border-gray-200"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.achieved
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {achievement.icon}
                        </div>

                        {achievement.achieved && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                            Achieved
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {achievement.title}
                      </CardTitle>
                      <CardDescription>
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {!achievement.achieved ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {achievement.currentValue} /{" "}
                              {achievement.requiredValue}
                            </span>
                          </div>
                          <Progress
                            value={calculateProgress(
                              achievement.currentValue,
                              achievement.requiredValue
                            )}
                            className="h-2 bg-gray-100"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Achieved on {achievement.achievedDate}
                          </p>

                          {achievement.nextLevel && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700">
                                Next level:
                              </p>
                              <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-gray-600">
                                  {achievement.nextLevel.title}
                                </span>
                                <span className="font-medium">
                                  {achievement.currentValue} /{" "}
                                  {achievement.nextLevel.requiredValue}
                                </span>
                              </div>
                              <Progress
                                value={calculateProgress(
                                  achievement.currentValue,
                                  achievement.nextLevel.requiredValue
                                )}
                                className="h-2 bg-gray-100 mt-1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filterAchievements(activeTab).length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-2">
                    No achievements in this category yet
                  </p>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    Continue donating to unlock more achievements
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Share Achievements Card */}
          <Card className="mt-8 bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Share Your Achievements
                  </h3>
                  <p className="text-sm text-gray-600">
                    Inspire others by sharing your blood donation journey
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-white border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Journey
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Friends
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </RouteGuard>
  );
};

export default DonorAchievements;
