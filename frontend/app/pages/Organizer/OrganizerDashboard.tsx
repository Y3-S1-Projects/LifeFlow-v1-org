import React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  Droplet,
  Users,
  MapPin,
  TrendingUp,
  Heart,
} from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { RouteGuard } from "../../components/RouteGuard";

const OrganizerDashboard = () => {
  const [isDarkMode] = useState(false);
  // Sample data - in a real app, this would come from an API
  const stats = {
    totalDonors: 1245,
    todaysDonors: 48,
    upcomingCamps: 3,
    bloodUnitsCollected: 892,
    targetAchieved: 74,
  };

  const upcomingCamps = [
    {
      id: 1,
      name: "City Hospital Drive",
      date: "2025-02-25",
      location: "City Hospital",
      targetDonors: 100,
      registeredDonors: 65,
    },
    {
      id: 2,
      name: "Corporate Park Event",
      date: "2025-02-28",
      location: "Tech Park",
      targetDonors: 150,
      registeredDonors: 89,
    },
    {
      id: 3,
      name: "Community Center",
      date: "2025-03-02",
      location: "Downtown",
      targetDonors: 80,
      registeredDonors: 45,
    },
  ];

  const bloodTypeStatus = [
    { type: "A+", units: 125, demand: "High" },
    { type: "B+", units: 98, demand: "Medium" },
    { type: "O+", units: 156, demand: "Critical" },
    { type: "AB+", units: 45, demand: "Low" },
  ];

  return (
    <RouteGuard requiredRoles={["organizer"]}>
      <div className="w-full">
        <Header />
        <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4  mx-auto space-y-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Blood Camp Dashboard
            </h1>
            <Button className="bg-red-600 hover:bg-red-700">+ New Camp</Button>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Donors</p>
                    <h3 className="text-2xl font-bold">{stats.totalDonors}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Droplet className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Blood Units Collected
                    </p>
                    <h3 className="text-2xl font-bold">
                      {stats.bloodUnitsCollected}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <CalendarDays className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Camps</p>
                    <h3 className="text-2xl font-bold">
                      {stats.upcomingCamps}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Target Achievement</p>
                    <h3 className="text-2xl font-bold">
                      {stats.targetAchieved}%
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Camps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Upcoming Blood Camps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingCamps.map((camp) => (
                    <div
                      key={camp.id}
                      className="p-4 bg-white rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {camp.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {camp.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(camp.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {camp.registeredDonors}/{camp.targetDonors}{" "}
                            registered
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={
                          (camp.registeredDonors / camp.targetDonors) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Blood Type Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Blood Type Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bloodTypeStatus.map((blood) => (
                    <div
                      key={blood.type}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="font-semibold text-red-600">
                            {blood.type}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{blood.units} units</p>
                          <p className="text-sm text-gray-500">Available</p>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium
                    ${
                      blood.demand === "Critical"
                        ? "bg-red-100 text-red-800"
                        : blood.demand === "High"
                        ? "bg-orange-100 text-orange-800"
                        : blood.demand === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                      >
                        {blood.demand}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </RouteGuard>
  );
};

export default OrganizerDashboard;
