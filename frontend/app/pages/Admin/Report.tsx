"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import { Download, MapPin, Users, Droplet, Calendar, CheckCircle, Loader2 } from "lucide-react"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Define types for our data structures
type BloodTypeData = {
  name: string
  value: number
}

type DonationTrendData = {
  month: string
  donors: number
}

type CampLocationData = {
  name: string
  camps: number
  donors: number
}

type BloodCampData = {
  totalCamps: number
  totalDonors: number
  totalOrganizers: number
  donorsByBloodType: BloodTypeData[]
  donationTrends: DonationTrendData[]
  campLocations: CampLocationData[]
  loading: boolean
  error: string | null
}

// Colors for charts
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8AC926", "#1982C4"]

const BloodCampReport: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false)
  const [bloodCampData, setBloodCampData] = useState<BloodCampData>({
    totalCamps: 0,
    totalDonors: 0,
    totalOrganizers: 0,
    donorsByBloodType: [],
    donationTrends: [],
    campLocations: [],
    loading: true,
    error: null,
  })

  // Create refs for each chart/section we want to include in the PDF
  const reportRef = useRef<HTMLDivElement>(null)
  const bloodTypeChartRef = useRef<HTMLDivElement>(null)
  const donationTrendsRef = useRef<HTMLDivElement>(null)
  const locationChartRef = useRef<HTMLDivElement>(null)
  const locationTableRef = useRef<HTMLDivElement>(null)

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, bloodTypes, trends, locations] = await Promise.all([
          axios.get<{
            totalCamps: number
            totalDonors: number
            totalOrganizers: number
          }>("http://localhost:3001/api/stats/summary-stats"),
          axios.get<BloodTypeData[]>("http://localhost:3001/api/stats/blood-type-stats"),
          axios.get<DonationTrendData[]>("http://localhost:3001/api/stats/donation-trends"),
          axios.get<CampLocationData[]>("http://localhost:3001/api/stats/location-stats"),
        ])

        setBloodCampData({
          totalCamps: summary.data.totalCamps,
          totalDonors: summary.data.totalDonors,
          totalOrganizers: summary.data.totalOrganizers,
          donorsByBloodType: bloodTypes.data,
          donationTrends: trends.data,
          campLocations: locations.data,
          loading: false,
          error: null,
        })
      } catch (error) {
        setBloodCampData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "An unknown error occurred",
        }))
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleDownloadReport = useCallback(async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      // Create new PDF document
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      let yPosition = margin

      // Add title
      pdf.setFontSize(20)
      pdf.setTextColor(33, 33, 33)
      pdf.text("Blood Donation Camp Report", pageWidth / 2, yPosition, {
        align: "center",
      })
      yPosition += 10

      // Add date
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, {
        align: "center",
      })
      yPosition += 15

      // Add summary cards
      pdf.setFontSize(14)
      pdf.setTextColor(33, 33, 33)
      pdf.text("Summary Statistics", margin, yPosition)
      yPosition += 8

      pdf.setFontSize(12)
      pdf.setTextColor(66, 66, 66)
      pdf.text(`• Total Blood Camps: ${bloodCampData.totalCamps}`, margin + 5, yPosition)
      yPosition += 6
      pdf.text(`• Total Donors: ${bloodCampData.totalDonors}`, margin + 5, yPosition)
      yPosition += 6
      pdf.text(`• Total Camp Locations: ${bloodCampData.campLocations.length}`, margin + 5, yPosition)
      yPosition += 6
      pdf.text(`• Total Organizers: ${bloodCampData.totalOrganizers}`, margin + 5, yPosition)
      yPosition += 15

      // Convert and add blood type chart
      if (bloodTypeChartRef.current) {
        pdf.setFontSize(14)
        pdf.setTextColor(33, 33, 33)
        pdf.text("Donors by Blood Type", margin, yPosition)
        yPosition += 10

        const bloodTypeCanvas = await html2canvas(bloodTypeChartRef.current, {
          scale: 2,
          backgroundColor: null,
        })
        const bloodTypeImgData = bloodTypeCanvas.toDataURL("image/png")
        const bloodTypeImgWidth = 90
        const bloodTypeImgHeight = (bloodTypeCanvas.height * bloodTypeImgWidth) / bloodTypeCanvas.width

        pdf.addImage(bloodTypeImgData, "PNG", margin, yPosition, bloodTypeImgWidth, bloodTypeImgHeight)
        yPosition += bloodTypeImgHeight + 10
      }

      // Convert and add donation trends chart
      if (donationTrendsRef.current) {
        // Check if we need to add a new page
        if (yPosition + 80 > pageHeight) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.setFontSize(14)
        pdf.setTextColor(33, 33, 33)
        pdf.text("Donation Trends", margin, yPosition)
        yPosition += 10

        const trendsCanvas = await html2canvas(donationTrendsRef.current, {
          scale: 2,
          backgroundColor: null,
        })
        const trendsImgData = trendsCanvas.toDataURL("image/png")
        const trendsImgWidth = 180
        const trendsImgHeight = (trendsCanvas.height * trendsImgWidth) / trendsCanvas.width

        pdf.addImage(trendsImgData, "PNG", margin, yPosition, trendsImgWidth, trendsImgHeight)
        yPosition += trendsImgHeight + 10
      }

      // Add a new page for location chart and table
      pdf.addPage()
      yPosition = margin

      // Convert and add location chart
      if (locationChartRef.current) {
        pdf.setFontSize(14)
        pdf.setTextColor(33, 33, 33)
        pdf.text("Camps and Donors by Location", margin, yPosition)
        yPosition += 10

        const locationCanvas = await html2canvas(locationChartRef.current, {
          scale: 2,
          backgroundColor: null,
        })
        const locationImgData = locationCanvas.toDataURL("image/png")
        const locationImgWidth = 180
        const locationImgHeight = (locationCanvas.height * locationImgWidth) / locationCanvas.width

        pdf.addImage(locationImgData, "PNG", margin, yPosition, locationImgWidth, locationImgHeight)
        yPosition += locationImgHeight + 15
      }

      // Add location details table
      pdf.setFontSize(14)
      pdf.setTextColor(33, 33, 33)
      pdf.text("Camp Location Details", margin, yPosition)
      yPosition += 8

      // Create table headers
      pdf.setFontSize(10)
      pdf.setTextColor(66, 66, 66)

      const colWidths = [60, 35, 35, 40]
      const startX = margin

      // Draw table header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(startX, yPosition, sum(colWidths), 8, "F")
      pdf.setTextColor(33, 33, 33)

      let currentX = startX
      pdf.text("Location Name", currentX + 2, yPosition + 5)
      currentX += colWidths[0]

      pdf.text("No. of Camps", currentX + 2, yPosition + 5)
      currentX += colWidths[1]

      pdf.text("No. of Donors", currentX + 2, yPosition + 5)
      currentX += colWidths[2]

      pdf.text("Avg. Donors/Camp", currentX + 2, yPosition + 5)

      yPosition += 8

      // Draw table rows
      bloodCampData.campLocations.forEach((location, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin

          // Redraw table header on new page
          pdf.setFillColor(240, 240, 240)
          pdf.rect(startX, yPosition, sum(colWidths), 8, "F")
          pdf.setTextColor(33, 33, 33)

          currentX = startX
          pdf.text("Location Name", currentX + 2, yPosition + 5)
          currentX += colWidths[0]

          pdf.text("No. of Camps", currentX + 2, yPosition + 5)
          currentX += colWidths[1]

          pdf.text("No. of Donors", currentX + 2, yPosition + 5)
          currentX += colWidths[2]

          pdf.text("Avg. Donors/Camp", currentX + 2, yPosition + 5)

          yPosition += 8
        }

        // Set alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255)
        } else {
          pdf.setFillColor(248, 248, 248)
        }
        pdf.rect(startX, yPosition, sum(colWidths), 7, "F")

        pdf.setTextColor(66, 66, 66)
        currentX = startX

        pdf.text(location.name, currentX + 2, yPosition + 5)
        currentX += colWidths[0]

        pdf.text(location.camps.toString(), currentX + 2, yPosition + 5)
        currentX += colWidths[1]

        pdf.text(location.donors.toString(), currentX + 2, yPosition + 5)
        currentX += colWidths[2]

        const avgDonors = location.camps > 0 ? Math.round(location.donors / location.camps) : 0
        pdf.text(avgDonors.toString(), currentX + 2, yPosition + 5)

        yPosition += 7
      })

      // Draw total row
      pdf.setFillColor(230, 230, 230)
      pdf.rect(startX, yPosition, sum(colWidths), 7, "F")
      pdf.setTextColor(33, 33, 33)
      pdf.setFont("undefined", "bold")

      currentX = startX
      pdf.text("Total", currentX + 2, yPosition + 5)
      currentX += colWidths[0]

      pdf.text(bloodCampData.totalCamps.toString(), currentX + 2, yPosition + 5)
      currentX += colWidths[1]

      pdf.text(bloodCampData.totalDonors.toString(), currentX + 2, yPosition + 5)
      currentX += colWidths[2]

      const totalAvg =
        bloodCampData.totalCamps > 0 ? Math.round(bloodCampData.totalDonors / bloodCampData.totalCamps) : 0
      pdf.text(totalAvg.toString(), currentX + 2, yPosition + 5)

      // Add footer
      pdf.setFont("undefined", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(120, 120, 120)
      const pageCount = pdf.getNumberOfPages()

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.text(`Blood Donation Camp Report | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        })
      }

      // Save PDF
      pdf.save("Blood_Donation_Camp_Report.pdf")

      setIsDownloading(false)
      setDownloadComplete(true)

      setTimeout(() => {
        setDownloadComplete(false)
      }, 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setIsDownloading(false)
    }
  }, [isDownloading, bloodCampData])

  // Helper function to sum an array
  const sum = (array: number[]) => array.reduce((a, b) => a + b, 0)

  if (bloodCampData.loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-700">Loading report data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    )
  }

  if (bloodCampData.error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Report</h2>
          <p className="text-gray-600 mb-6">{bloodCampData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" ref={reportRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header with title and download button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Droplet className="h-8 w-8 text-red-600 mr-3" />
              Blood Donation Camp Report
            </h1>
            <p className="text-gray-500 mt-1">
              Generated on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className={`flex items-center px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${
              isDownloading
                ? "bg-gray-400 cursor-not-allowed"
                : downloadComplete
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
            } text-white font-medium`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : downloadComplete ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                PDF Downloaded!
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download PDF Report
              </>
            )}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-2 bg-red-600"></div>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <Calendar className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Blood Camps</p>
                  <h3 className="text-3xl font-bold text-gray-900">{bloodCampData.totalCamps.toLocaleString()}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-2 bg-red-600"></div>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <Droplet className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Donors</p>
                  <h3 className="text-3xl font-bold text-gray-900">{bloodCampData.totalDonors.toLocaleString()}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-2 bg-red-600"></div>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <MapPin className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Camp Locations</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {bloodCampData.campLocations.length.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="h-2 bg-red-600"></div>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <Users className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Organizers</p>
                  <h3 className="text-3xl font-bold text-gray-900">{bloodCampData.totalOrganizers.toLocaleString()}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b bg-gray-50 pb-3">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
                Donors by Blood Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-72" ref={bloodTypeChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bloodCampData.donorsByBloodType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {bloodCampData.donorsByBloodType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} donors`, "Count"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        padding: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b bg-gray-50 pb-3">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
                Donation Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-72" ref={donationTrendsRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bloodCampData.donationTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
                    <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#e0e0e0" }} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} donors`, "Count"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        padding: "10px",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="donors"
                      name="Monthly Donors"
                      stroke="#FF6384"
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: "#FF6384" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Row 2 */}
        <Card className="mb-8 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gray-50 pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
              Camps and Donors by Location
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-80" ref={locationChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bloodCampData.campLocations}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#666" }}
                    axisLine={{ stroke: "#e0e0e0" }}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#FF6384"
                    tick={{ fill: "#666" }}
                    axisLine={{ stroke: "#e0e0e0" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#36A2EB"
                    tick={{ fill: "#666" }}
                    axisLine={{ stroke: "#e0e0e0" }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar yAxisId="left" dataKey="camps" name="Number of Camps" fill="#FF6384" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="donors" name="Number of Donors" fill="#36A2EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Details Table */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b bg-gray-50 pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
              Camp Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto" ref={locationTableRef}>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-100 border-b-2 border-gray-200 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location Name
                    </th>
                    <th className="bg-gray-100 border-b-2 border-gray-200 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Number of Camps
                    </th>
                    <th className="bg-gray-100 border-b-2 border-gray-200 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Number of Donors
                    </th>
                    <th className="bg-gray-100 border-b-2 border-gray-200 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Avg. Donors per Camp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bloodCampData.campLocations.map((location, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{location.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {location.camps.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {location.donors.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {location.camps > 0 ? Math.round(location.donors / location.camps).toLocaleString() : 0}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {bloodCampData.totalCamps.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {bloodCampData.totalDonors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {bloodCampData.totalCamps > 0
                        ? Math.round(bloodCampData.totalDonors / bloodCampData.totalCamps).toLocaleString()
                        : 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-gray-500 text-sm bg-white p-4 rounded-lg shadow border-t-4 border-red-600">
          <p className="flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-2 text-red-600" />
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BloodCampReport
