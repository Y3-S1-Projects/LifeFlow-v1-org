import React, { useState } from "react";
import { Clipboard, Users, Droplet, MapPin, Bell } from "lucide-react";
import Header from "../../components/Header";
import UserDetailsTable from "./UserDetailsTable";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabData = [
    { id: "overview", label: "Overview", icon: <Clipboard className="h-5 w-5" /> },
    { id: "donors", label: "Donor Management", icon: <Users className="h-5 w-5" /> },
    { id: "inventory", label: "Blood Inventory", icon: <Droplet className="h-5 w-5" /> },
    { id: "centers", label: "Donation Centers", icon: <MapPin className="h-5 w-5" /> },
    { id: "requests", label: "Donation Requests", icon: <Bell className="h-5 w-5" /> },
    { id: "users", label: "User Management", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="p-4">
      <Header />
      <div className="flex space-x-4 mb-4">
        {tabData.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "overview" && <div>Overview Content</div>}
        {activeTab === "donors" && <div>Donor Management Content</div>}
        {activeTab === "inventory" && <div>Blood Inventory Content</div>}
        {activeTab === "centers" && <div>Donation Centers Content</div>}
        {activeTab === "requests" && <div>Donation Requests Content</div>}
        {activeTab === "users" && <UserDetailsTable />}
      </div>
    </div>
  );
};

export default AdminDashboard;
