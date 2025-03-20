"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Phone, MessageSquare, Clock, Calendar, Users, MapPin, Activity, TrendingUp, AlertCircle } from "lucide-react"
import SupportHeader from "@/app/components/SupportHeader"

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  timestamp: string
}

const SupportDashboard: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:3001/api/contact/messages")
      .then((response) => response.json())
      .then((data) => {
        setMessages(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching messages:", error)
        setIsLoading(false)
      })
  }, [])

  const caseData = [
    { name: "Delhi", value: 35 },
    { name: "Mumbai", value: 28 },
    { name: "Chennai", value: 12 },
    { name: "Bangalore", value: 18 },
    { name: "Others", value: 7 },
  ]

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#A28DFF"]

  const weeklyCaseData = [
    { day: "Mon", cases: 4 },
    { day: "Tue", cases: 6 },
    { day: "Wed", cases: 8 },
    { day: "Thu", cases: 10 },
    { day: "Fri", cases: 9 },
    { day: "Sat", cases: 7 },
    { day: "Sun", cases: 5 },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{`${label} : ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <SupportHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Activity className="mr-2 text-red-500" />
              Support Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-red-400" />
              Blood Camp Finder Support Overview
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="h-4 w-4 mr-1" />
              Live Updates
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors duration-200">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-blue-600 transition-colors duration-200">
                  12
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+8%</span>
              <span className="ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4 group-hover:bg-red-100 transition-colors duration-200">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Camp Requests</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-red-600 transition-colors duration-200">
                  34
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4 group-hover:bg-green-100 transition-colors duration-200">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Calls Today</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-green-600 transition-colors duration-200">
                  28
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+5%</span>
              <span className="ml-1">from yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-red-100 group">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4 group-hover:bg-purple-100 transition-colors duration-200">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Response</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1 group-hover:text-purple-600 transition-colors duration-200">
                  14 min
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">-2 min</span>
              <span className="ml-1">from last week</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-red-500" />
              Cases by Region
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {caseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Weekly Case Load
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCaseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cases" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={36}>
                    {weeklyCaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? "#8884d8" : "#a794f7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
              Contact Messages
            </h2>
            <div className="mt-2 md:mt-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {messages.length} total messages
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
                    </td>
                  </tr>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <tr
                      key={msg.id}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${index === messages.length - 1 ? "rounded-b-lg" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{msg.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{msg.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      <p className="text-gray-500 flex flex-col items-center justify-center">
                        <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                        <span>No messages found.</span>
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportDashboard

