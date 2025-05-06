import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { Download, MapPin, Users, Droplet, Calendar } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Define types for our data structures
type BloodTypeData = {
  name: string;
  value: number;
};

type DonationTrendData = {
  month: string;
  donors: number;
};

type CampLocationData = {
  name: string;
  camps: number;
  donors: number;
};

type BloodCampData = {
  totalCamps: number;
  totalDonors: number;
  totalOrganizers: number;
  donorsByBloodType: BloodTypeData[];
  donationTrends: DonationTrendData[];
  campLocations: CampLocationData[];
  loading: boolean;
  error: string | null;
};

// Colors for charts
const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8AC926",
  "#1982C4",
];

const BloodCampReport: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const [bloodCampData, setBloodCampData] = useState<BloodCampData>({
    totalCamps: 0,
    totalDonors: 0,
    totalOrganizers: 0,
    donorsByBloodType: [],
    donationTrends: [],
    campLocations: [],
    loading: true,
    error: null,
  });

  // Create refs for each chart/section we want to include in the PDF
  const reportRef = useRef<HTMLDivElement>(null);
  const bloodTypeChartRef = useRef<HTMLDivElement>(null);
  const donationTrendsRef = useRef<HTMLDivElement>(null);
  const locationChartRef = useRef<HTMLDivElement>(null);
  const locationTableRef = useRef<HTMLDivElement>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, bloodTypes, trends, locations] = await Promise.all([
          axios.get<{
            totalCamps: number;
            totalDonors: number;
            totalOrganizers: number;
          }>("http://localhost:3001/api/stats/summary-stats"),
          axios.get<BloodTypeData[]>(
            "http://localhost:3001/api/stats/blood-type-stats"
          ),
          axios.get<DonationTrendData[]>(
            "http://localhost:3001/api/stats/donation-trends"
          ),
          axios.get<CampLocationData[]>(
            "http://localhost:3001/api/stats/location-stats"
          ),
        ]);

        setBloodCampData({
          totalCamps: summary.data.totalCamps,
          totalDonors: summary.data.totalDonors,
          totalOrganizers: summary.data.totalOrganizers,
          donorsByBloodType: bloodTypes.data,
          donationTrends: trends.data,
          campLocations: locations.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setBloodCampData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        }));
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadReport = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      // Create new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Blood Donation Camp Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Add summary cards
      pdf.setFontSize(14);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Summary Statistics", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.setTextColor(66, 66, 66);
      pdf.text(
        `• Total Blood Camps: ${bloodCampData.totalCamps}`,
        margin + 5,
        yPosition
      );
      yPosition += 6;
      pdf.text(
        `• Total Donors: ${bloodCampData.totalDonors}`,
        margin + 5,
        yPosition
      );
      yPosition += 6;
      pdf.text(
        `• Total Camp Locations: ${bloodCampData.campLocations.length}`,
        margin + 5,
        yPosition
      );
      yPosition += 6;
      pdf.text(
        `• Total Organizers: ${bloodCampData.totalOrganizers}`,
        margin + 5,
        yPosition
      );
      yPosition += 15;

      // Convert and add blood type chart
      if (bloodTypeChartRef.current) {
        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Donors by Blood Type", margin, yPosition);
        yPosition += 10;

        const bloodTypeCanvas = await html2canvas(bloodTypeChartRef.current, {
          scale: 2,
          backgroundColor: null,
        });
        const bloodTypeImgData = bloodTypeCanvas.toDataURL("image/png");
        const bloodTypeImgWidth = 90;
        const bloodTypeImgHeight =
          (bloodTypeCanvas.height * bloodTypeImgWidth) / bloodTypeCanvas.width;

        pdf.addImage(
          bloodTypeImgData,
          "PNG",
          margin,
          yPosition,
          bloodTypeImgWidth,
          bloodTypeImgHeight
        );
        yPosition += bloodTypeImgHeight + 10;
      }

      // Convert and add donation trends chart
      if (donationTrendsRef.current) {
        // Check if we need to add a new page
        if (yPosition + 80 > pageHeight) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Donation Trends", margin, yPosition);
        yPosition += 10;

        const trendsCanvas = await html2canvas(donationTrendsRef.current, {
          scale: 2,
          backgroundColor: null,
        });
        const trendsImgData = trendsCanvas.toDataURL("image/png");
        const trendsImgWidth = 180;
        const trendsImgHeight =
          (trendsCanvas.height * trendsImgWidth) / trendsCanvas.width;

        pdf.addImage(
          trendsImgData,
          "PNG",
          margin,
          yPosition,
          trendsImgWidth,
          trendsImgHeight
        );
        yPosition += trendsImgHeight + 10;
      }

      // Add a new page for location chart and table
      pdf.addPage();
      yPosition = margin;

      // Convert and add location chart
      if (locationChartRef.current) {
        pdf.setFontSize(14);
        pdf.setTextColor(33, 33, 33);
        pdf.text("Camps and Donors by Location", margin, yPosition);
        yPosition += 10;

        const locationCanvas = await html2canvas(locationChartRef.current, {
          scale: 2,
          backgroundColor: null,
        });
        const locationImgData = locationCanvas.toDataURL("image/png");
        const locationImgWidth = 180;
        const locationImgHeight =
          (locationCanvas.height * locationImgWidth) / locationCanvas.width;

        pdf.addImage(
          locationImgData,
          "PNG",
          margin,
          yPosition,
          locationImgWidth,
          locationImgHeight
        );
        yPosition += locationImgHeight + 15;
      }

      // Add location details table
      pdf.setFontSize(14);
      pdf.setTextColor(33, 33, 33);
      pdf.text("Camp Location Details", margin, yPosition);
      yPosition += 8;

      // Create table headers
      pdf.setFontSize(10);
      pdf.setTextColor(66, 66, 66);

      const colWidths = [60, 35, 35, 40];
      const startX = margin;

      // Draw table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(startX, yPosition, sum(colWidths), 8, "F");
      pdf.setTextColor(33, 33, 33);

      let currentX = startX;
      pdf.text("Location Name", currentX + 2, yPosition + 5);
      currentX += colWidths[0];

      pdf.text("No. of Camps", currentX + 2, yPosition + 5);
      currentX += colWidths[1];

      pdf.text("No. of Donors", currentX + 2, yPosition + 5);
      currentX += colWidths[2];

      pdf.text("Avg. Donors/Camp", currentX + 2, yPosition + 5);

      yPosition += 8;

      // Draw table rows
      bloodCampData.campLocations.forEach((location, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;

          // Redraw table header on new page
          pdf.setFillColor(240, 240, 240);
          pdf.rect(startX, yPosition, sum(colWidths), 8, "F");
          pdf.setTextColor(33, 33, 33);

          currentX = startX;
          pdf.text("Location Name", currentX + 2, yPosition + 5);
          currentX += colWidths[0];

          pdf.text("No. of Camps", currentX + 2, yPosition + 5);
          currentX += colWidths[1];

          pdf.text("No. of Donors", currentX + 2, yPosition + 5);
          currentX += colWidths[2];

          pdf.text("Avg. Donors/Camp", currentX + 2, yPosition + 5);

          yPosition += 8;
        }

        // Set alternating row background
        if (index % 2 === 0) {
          pdf.setFillColor(255, 255, 255);
        } else {
          pdf.setFillColor(248, 248, 248);
        }
        pdf.rect(startX, yPosition, sum(colWidths), 7, "F");

        pdf.setTextColor(66, 66, 66);
        currentX = startX;

        pdf.text(location.name, currentX + 2, yPosition + 5);
        currentX += colWidths[0];

        pdf.text(location.camps.toString(), currentX + 2, yPosition + 5);
        currentX += colWidths[1];

        pdf.text(location.donors.toString(), currentX + 2, yPosition + 5);
        currentX += colWidths[2];

        const avgDonors =
          location.camps > 0 ? Math.round(location.donors / location.camps) : 0;
        pdf.text(avgDonors.toString(), currentX + 2, yPosition + 5);

        yPosition += 7;
      });

      // Draw total row
      pdf.setFillColor(230, 230, 230);
      pdf.rect(startX, yPosition, sum(colWidths), 7, "F");
      pdf.setTextColor(33, 33, 33);
      pdf.setFont("undefined", "bold");

      currentX = startX;
      pdf.text("Total", currentX + 2, yPosition + 5);
      currentX += colWidths[0];

      pdf.text(
        bloodCampData.totalCamps.toString(),
        currentX + 2,
        yPosition + 5
      );
      currentX += colWidths[1];

      pdf.text(
        bloodCampData.totalDonors.toString(),
        currentX + 2,
        yPosition + 5
      );
      currentX += colWidths[2];

      const totalAvg =
        bloodCampData.totalCamps > 0
          ? Math.round(bloodCampData.totalDonors / bloodCampData.totalCamps)
          : 0;
      pdf.text(totalAvg.toString(), currentX + 2, yPosition + 5);

      // Add footer
      pdf.setFont("undefined", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      const pageCount = pdf.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Blood Donation Camp Report | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save PDF
      pdf.save("Blood_Donation_Camp_Report.pdf");

      setIsDownloading(false);
      setDownloadComplete(true);

      setTimeout(() => {
        setDownloadComplete(false);
      }, 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsDownloading(false);
    }
  }, [isDownloading, bloodCampData]);

  // Helper function to sum an array
  const sum = (array: number[]) => array.reduce((a, b) => a + b, 0);

  if (bloodCampData.loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading report data...</p>
        </div>
      </div>
    );
  }

  if (bloodCampData.error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading report: {bloodCampData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Blood Donation Camp Report
        </h1>
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className={`flex items-center px-4 py-2 ${
            isDownloading
              ? "bg-gray-400"
              : downloadComplete
              ? "bg-green-600"
              : "bg-red-600"
          } text-white rounded-md hover:bg-red-700 transition-colors`}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading
            ? "Generating PDF..."
            : downloadComplete
            ? "PDF Downloaded!"
            : "Download PDF Report"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Blood Camps
                </p>
                <h3 className="text-2xl font-bold">
                  {bloodCampData.totalCamps}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Donors
                </p>
                <h3 className="text-2xl font-bold">
                  {bloodCampData.totalDonors}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Camp Locations
                </p>
                <h3 className="text-2xl font-bold">
                  {bloodCampData.campLocations.length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Organizers
                </p>
                <h3 className="text-2xl font-bold">
                  {bloodCampData.totalOrganizers}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Donors by Blood Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" ref={bloodTypeChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodCampData.donorsByBloodType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bloodCampData.donorsByBloodType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} donors`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" ref={donationTrendsRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bloodCampData.donationTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} donors`, "Count"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="donors"
                    stroke="#FF6384"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Row 2 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Camps and Donors by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72" ref={locationChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bloodCampData.campLocations}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#FF6384" />
                <YAxis yAxisId="right" orientation="right" stroke="#36A2EB" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="camps"
                  name="Number of Camps"
                  fill="#FF6384"
                />
                <Bar
                  yAxisId="right"
                  dataKey="donors"
                  name="Number of Donors"
                  fill="#36A2EB"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Location Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Camp Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" ref={locationTableRef}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left">Location Name</th>
                  <th className="border px-4 py-2 text-left">
                    Number of Camps
                  </th>
                  <th className="border px-4 py-2 text-left">
                    Number of Donors
                  </th>
                  <th className="border px-4 py-2 text-left">
                    Avg. Donors per Camp
                  </th>
                </tr>
              </thead>
              <tbody>
                {bloodCampData.campLocations.map((location, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-4 py-2">{location.name}</td>
                    <td className="border px-4 py-2">{location.camps}</td>
                    <td className="border px-4 py-2">{location.donors}</td>
                    <td className="border px-4 py-2">
                      {location.camps > 0
                        ? Math.round(location.donors / location.camps)
                        : 0}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border px-4 py-2">Total</td>
                  <td className="border px-4 py-2">
                    {bloodCampData.totalCamps}
                  </td>
                  <td className="border px-4 py-2">
                    {bloodCampData.totalDonors}
                  </td>
                  <td className="border px-4 py-2">
                    {bloodCampData.totalCamps > 0
                      ? Math.round(
                          bloodCampData.totalDonors / bloodCampData.totalCamps
                        )
                      : 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-gray-500 text-sm">
        <p>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default BloodCampReport;
