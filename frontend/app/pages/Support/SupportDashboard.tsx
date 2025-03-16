import React, { useState } from "react";
import { Bar, Pie } from "recharts";
import {
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  User,
  Users,
  MapPin,
  BookOpen,
} from "lucide-react";
import SupportHeader from "@/app/components/SupportHeader";

interface SupportStat {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  change: number;
}

interface CaseData {
  id: string;
  status: "open" | "resolved" | "pending";
  priority: "high" | "medium" | "low";
  subject: string;
  customer: string;
  location: string;
  timestamp: string;
  assignee: string;
}

const SupportDashboard: React.FC = () => {
  // Sample stats for support agent
  const supportStats: SupportStat[] = [
    {
      id: "1",
      label: "Active Cases",
      value: 12,
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      change: 2,
    },
    {
      id: "2",
      label: "Camp Requests",
      value: 34,
      icon: <MapPin className="h-6 w-6 text-red-500" />,
      change: -5,
    },
    {
      id: "3",
      label: "Calls Today",
      value: 28,
      icon: <Phone className="h-6 w-6 text-green-500" />,
      change: 4,
    },
    {
      id: "4",
      label: "Avg Response",
      value: 14,
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      change: -2,
    },
  ];

  // Sample case for recent activity
  const recentCase: CaseData = {
    id: "CS-1234",
    status: "open",
    priority: "high",
    subject: "Need blood camp location update in North Delhi",
    customer: "Priya Sharma",
    location: "Delhi, India",
    timestamp: "10:24 AM",
    assignee: "You",
  };

  // Sample data for charts
  const casesByRegion = [
    { name: "Delhi", value: 35 },
    { name: "Mumbai", value: 28 },
    { name: "Bangalore", value: 18 },
    { name: "Chennai", value: 12 },
    { name: "Others", value: 7 },
  ];

  const issueTypes = [
    { name: "Location Update", value: 42 },
    { name: "Registration", value: 28 },
    { name: "Technical Error", value: 16 },
    { name: "Eligibility", value: 14 },
  ];

  const weeklyCases = [
    { day: "Mon", count: 15 },
    { day: "Tue", count: 12 },
    { day: "Wed", count: 18 },
    { day: "Thu", count: 22 },
    { day: "Fri", count: 25 },
    { day: "Sat", count: 18 },
    { day: "Sun", count: 10 },
  ];

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="p-4 bg-gray-50 min-h-screen ">
      <SupportHeader />
      <div className="mb-6 mt-10">
        <h1 className="text-2xl font-bold text-gray-800">Support Dashboard</h1>
        <p className="text-gray-500">Blood Camp Finder Support Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {supportStats.map((stat) => (
          <div key={stat.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div
                  className={`text-xs ${
                    stat.change >= 0 ? "text-green-500" : "text-red-500"
                  } flex items-center mt-1`}
                >
                  {stat.change >= 0 ? "+" : ""}
                  {stat.change}% from yesterday
                </div>
              </div>
              <div className="p-2 rounded-full bg-gray-100">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cases by Region */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Cases by Region</h2>
          <div className="h-64 flex justify-center items-center">
            <div className="w-full h-full flex justify-center items-center">
              <div className="w-full max-w-xs">
                <svg viewBox="0 0 400 400" width="100%" height="100%">
                  <Pie
                    data={casesByRegion}
                    cx={200}
                    cy={200}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {casesByRegion.map((entry, index) => (
                      <g key={`cell-${index}`}>
                        <path fill={colors[index % colors.length]} />
                      </g>
                    ))}
                  </Pie>
                  <text
                    x={200}
                    y={200}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-semibold"
                  >
                    Total: 100
                  </text>
                </svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {casesByRegion.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <span
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></span>
                <span className="truncate">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Case Load */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Weekly Case Load</h2>
          <div className="h-64">
            <svg viewBox="0 0 500 300" width="100%" height="100%">
              <Bar data={weeklyCases} barSize={30}>
                {weeklyCases.map((entry, index) => (
                  <g key={`bar-${index}`}>
                    <rect
                      x={(500 / weeklyCases.length) * index + 20}
                      y={300 - entry.count * 8}
                      width={30}
                      height={entry.count * 8}
                      fill="#3B82F6"
                      rx={4}
                    />
                    <text
                      x={(500 / weeklyCases.length) * index + 35}
                      y={300 - entry.count * 8 - 10}
                      textAnchor="middle"
                      fill="#4B5563"
                      fontSize="12"
                    >
                      {entry.count}
                    </text>
                    <text
                      x={(500 / weeklyCases.length) * index + 35}
                      y={285}
                      textAnchor="middle"
                      fill="#4B5563"
                      fontSize="12"
                    >
                      {entry.day}
                    </text>
                  </g>
                ))}
              </Bar>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Activity & Map Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{recentCase.subject}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {recentCase.customer} • {recentCase.location}
                </p>
              </div>
              <div
                className={`px-2 py-1 text-xs rounded-full ${
                  recentCase.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : recentCase.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {recentCase.priority}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Case #{recentCase.id}</span>
              <span>{recentCase.timestamp}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" /> Call
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Message
              </button>
            </div>
          </div>

          {/* Issue Type Distribution */}
          <h3 className="text-md font-semibold mb-3 mt-6">Issue Types</h3>
          <div className="space-y-3">
            {issueTypes.map((issue, index) => (
              <div key={index} className="flex items-center">
                <span className="text-xs w-28 truncate">{issue.name}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${issue.value}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
                <span className="text-xs ml-2">{issue.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Integration */}
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Active Blood Camps</h2>
          <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-10 w-10 mx-auto text-red-500 mb-2" />
              <p className="text-gray-500">
                Google Maps integration will show active blood camps here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                10 active camps in your region
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>{" "}
                Active (8)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>{" "}
                Upcoming (2)
              </span>
            </div>
            <button className="text-blue-500 hover:underline text-sm">
              View All Camps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
