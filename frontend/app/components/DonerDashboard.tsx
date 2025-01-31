import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Droplet,
  Award,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";
import Header from "./Header";
import useUser from "../hooks/useUser";

// Define Type for Donation History
interface Donation {
  date: string;
  location: string;
  bloodType: string;
  volume: string;
}

const DonorDashboard: React.FC = () => {
  const { user, loading, error } = useUser();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
  const impactLives = totalDonations * 3; // Each donation can help up to 3 people
  const nextEligibleDate = "2025-04-15";

  return (
    <div className="min-h-screen p-6 w-full mx-auto space-y-6 flex flex-col">
      <Header />
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {user?.firstName || "Donor"}!
        </h2>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Blood Type:</strong> {user?.bloodType || "N/A"}
        </p>
        <p>
          <strong>Verified:</strong> {user?.isVerified ? "Yes" : "No"}
        </p>
      </div>

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

      {/* Stats Grid */}
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
            <p className="text-xs text-muted-foreground">Mark your calendar</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
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
    </div>
  );
};

export default DonorDashboard;
