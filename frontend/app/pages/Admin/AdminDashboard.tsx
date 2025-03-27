"use client"

import { useState } from "react"
import {
  Clipboard,
  Users,
  Droplet,
  MapPin,
  Bell,
  Activity,
  PieChart,
  TrendingUp,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserDetailsTable from "./UserDetailsTable"
import SupportAdminsTable from "./SupportDetailsTable"
import Footer from "../../components/Footer"
import Header from "../../components/Header"
import OrganizerTable from "./IneligibleOrganizersTable"
import MapComponent from "@/app/components/Map"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const stats = [
    {
      title: "Total Donations",
      value: "1,294",
      change: "+12.5%",
      icon: <Droplet className="h-8 w-8 text-white" />,
    },
    {
      title: "Active Donors",
      value: "856",
      change: "+4.2%",
      icon: <Users className="h-8 w-8 text-white" />,
    },
    {
      title: "Blood Requests",
      value: "38",
      change: "-2.5%",
      icon: <Bell className="h-8 w-8 text-white" />,
    },
    {
      title: "Donation Centers",
      value: "12",
      change: "+1",
      icon: <MapPin className="h-8 w-8 text-white" />,
    },
  ]

  const bloodTypes = [
    { type: "A+", current: 45, target: 60 },
    { type: "A-", current: 28, target: 40 },
    { type: "B+", current: 52, target: 50 },
    { type: "B-", current: 18, target: 30 },
    { type: "AB+", current: 32, target: 35 },
    { type: "AB-", current: 15, target: 25 },
    { type: "O+", current: 65, target: 70 },
    { type: "O-", current: 22, target: 40 },
  ]

  const tabData = [
    {
      id: "overview",
      label: "Overview",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "inventory",
      label: "Blood Inventory",
      icon: <Droplet className="h-5 w-5" />,
    },
    {
      id: "centers",
      label: "Donation Centers",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: "Organizer",
      label: "Organizer Requests",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "Support",
      label: "Support Management",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "Camp",
      label: "Camp Requests",
      icon: <Clipboard className="h-5 w-5" />,
    },
  ]

  const recentDonors = [
    {
      name: "Sarah Johnson",
      bloodType: "O+",
      date: "Mar 15, 2025",
      center: "Central Hospital",
    },
    {
      name: "Michael Chen",
      bloodType: "A-",
      date: "Mar 14, 2025",
      center: "Westside Clinic",
    },
    {
      name: "Aisha Patel",
      bloodType: "B+",
      date: "Mar 14, 2025",
      center: "Memorial Center",
    },
    {
      name: "David Wilson",
      bloodType: "AB+",
      date: "Mar 13, 2025",
      center: "Downtown Medical",
    },
  ]

  const sections = [
    { title: "Main", range: [0, 3] },
    { title: "Management", range: [3, 8] },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="w-full">
      <Header />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 shadow-md">
          <div className="p-5 bg-gradient-to-r from-red-600 to-red-700">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Heart className="mr-2 h-6 w-6 fill-white" /> BloodConnect
            </h2>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            {sections.map(({ title, range }, index) => (
              <div key={index} className="mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">{title}</p>
                <ul className="space-y-1">
                  {tabData.slice(range[0], range[1]).map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`mr-3 ${activeTab === tab.id ? "text-red-600" : "text-gray-400"}`}>
                          {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && <span className="ml-auto w-1.5 h-6 rounded-full bg-red-600"></span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@bloodconnect.org</p>
              </div>
              <LogOut className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between shadow-sm">
            <h2 className="text-xl font-bold text-red-600 flex items-center">
              <Heart className="mr-2 h-6 w-6 fill-red-600" /> BloodConnect
            </h2>
            <button className="p-2 rounded-md hover:bg-gray-100" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
            </button>
          </header>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b shadow-lg fixed top-16 left-0 right-0 z-30">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none"
                  />
                </div>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabData.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`mr-3 ${activeTab === tab.id ? "text-red-600" : "text-gray-400"}`}>
                          {tab.icon}
                        </span>
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t">
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@bloodconnect.org</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="bg-white p-6 border-b shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="p-2 rounded-lg bg-red-100 text-red-600 mr-3">
                    {tabData.find((tab) => tab.id === activeTab)?.icon}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {tabData.find((tab) => tab.id === activeTab)?.label}
                  </h1>
                </div>
                <p className="text-gray-500 mt-1">Manage and monitor your blood donation operations</p>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6 bg-gray-50">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${
                          i === 0
                            ? "from-red-500 to-red-600"
                            : i === 1
                              ? "from-blue-500 to-blue-600"
                              : i === 2
                                ? "from-amber-500 to-amber-600"
                                : "from-green-500 to-green-600"
                        } h-2`}
                      ></div>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div
                            className={`rounded-lg p-3 mr-4 ${
                              i === 0
                                ? "bg-red-500"
                                : i === 1
                                  ? "bg-blue-500"
                                  : i === 2
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                            }`}
                          >
                            {stat.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <div className="flex items-baseline">
                              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                              <span
                                className={`text-sm ml-2 ${
                                  stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {stat.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Blood Inventory */}
                <Card className="border-none shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-1"></div>
                  <CardHeader className="pb-2 pt-6 px-6">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-red-500" />
                      Blood Inventory Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {bloodTypes.map((blood, i) => (
                        <div key={i} className="space-y-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">{blood.type}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                blood.current / blood.target < 0.5
                                  ? "bg-red-100 text-red-700"
                                  : blood.current / blood.target < 0.8
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {Math.round((blood.current / blood.target) * 100)}%
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {blood.current}/{blood.target} units
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                blood.current / blood.target < 0.5
                                  ? "bg-red-500"
                                  : blood.current / blood.target < 0.8
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (blood.current / blood.target) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Donors */}
                <Card className="border-none shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1"></div>
                  <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                      Recent Donations
                    </CardTitle>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-xs text-gray-500">
                            <th className="text-left py-3 px-4 font-medium">Donor</th>
                            <th className="text-center py-3 px-4 font-medium">Blood Type</th>
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Center</th>
                            <th className="text-right py-3 px-4 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentDonors.map((donor, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">{donor.name}</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 font-bold text-sm border border-red-100">
                                  {donor.bloodType}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-gray-500">{donor.date}</td>
                              <td className="py-4 px-4">{donor.center}</td>
                              <td className="py-4 px-4 text-right">
                                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                  Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "Support" && (
              <div className="bg-white rounded-lg shadow-md">
                <SupportAdminsTable />
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium mb-4">Blood Inventory</h2>
                <p>Blood inventory content will go here.</p>
              </div>
            )}

            {activeTab === "centers" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium mb-4">Donation Centers</h2>
                <MapComponent apiKey={""} userLatitude={0} userLongitude={0} />
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-lg shadow-md">
                <UserDetailsTable />
              </div>
            )}

            {activeTab === "Organizer" && (
              <div className="bg-white rounded-lg shadow-md">
                <OrganizerTable />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer isDarkMode={false} />
    </div>
  )
}

export default AdminDashboard

