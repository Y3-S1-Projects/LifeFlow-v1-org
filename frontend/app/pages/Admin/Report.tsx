import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, MapPin, Users, Droplet, Calendar } from 'lucide-react';

// Sample data
const bloodCampData = {
  totalCamps: 48,
  totalDonors: 2845,
  totalOrganizers: 124,
  donorsByBloodType: [
    { name: 'A+', value: 1052 },
    { name: 'O+', value: 892 },
    { name: 'B+', value: 521 },
    { name: 'AB+', value: 185 },
    { name: 'A-', value: 82 },
    { name: 'O-', value: 64 },
    { name: 'B-', value: 28 },
    { name: 'AB-', value: 21 },
  ],
  donationTrends: [
    { month: 'Jan', donors: 210 },
    { month: 'Feb', donors: 240 },
    { month: 'Mar', donors: 300 },
    { month: 'Apr', donors: 278 },
    { month: 'May', donors: 289 },
    { month: 'Jun', donors: 339 },
    { month: 'Jul', donors: 349 },
    { month: 'Aug', donors: 430 },
    { month: 'Sep', donors: 410 },
  ],
  campLocations: [
    { name: 'City Hospital', camps: 10, donors: 580 },
    { name: 'University Campus', camps: 8, donors: 495 },
    { name: 'Community Center', camps: 7, donors: 420 },
    { name: 'Corporate Park', camps: 12, donors: 705 },
    { name: 'Shopping Mall', camps: 6, donors: 380 },
    { name: 'Sports Stadium', camps: 5, donors: 265 },
  ],
};

// Colors for charts
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC926', '#1982C4'];

const BloodCampReport = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Use useCallback to stabilize the event handler
  const handleDownloadReport = useCallback(() => {
    if (isDownloading) return; // Prevent multiple clicks
    
    setIsDownloading(true);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
      
      // Reset download complete status after showing success
      setTimeout(() => {
        setDownloadComplete(false);
      }, 3000);
    }, 1500);
  }, [isDownloading]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blood Donation Camp Report</h1>
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className={`flex items-center px-4 py-2 ${isDownloading ? 'bg-gray-400' : downloadComplete ? 'bg-green-600' : 'bg-red-600'} text-white rounded-md hover:bg-red-700 transition-colors`}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? 'Downloading...' : downloadComplete ? 'Downloaded!' : 'Download Report'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Blood Camps</p>
                <h3 className="text-2xl font-bold">{bloodCampData.totalCamps}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Donors</p>
                <h3 className="text-2xl font-bold">{bloodCampData.totalDonors}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Camp Locations</p>
                <h3 className="text-2xl font-bold">{bloodCampData.campLocations.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Organizers</p>
                <h3 className="text-2xl font-bold">{bloodCampData.totalOrganizers}</h3>
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodCampData.donorsByBloodType}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bloodCampData.donorsByBloodType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} donors`, 'Count']} />
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={bloodCampData.donationTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} donors`, 'Count']} />
                  <Legend />
                  <Line type="monotone" dataKey="donors" stroke="#FF6384" activeDot={{ r: 8 }} />
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
          <div className="h-72">
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
                <Bar yAxisId="left" dataKey="camps" name="Number of Camps" fill="#FF6384" />
                <Bar yAxisId="right" dataKey="donors" name="Number of Donors" fill="#36A2EB" />
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left">Location Name</th>
                  <th className="border px-4 py-2 text-left">Number of Camps</th>
                  <th className="border px-4 py-2 text-left">Number of Donors</th>
                  <th className="border px-4 py-2 text-left">Avg. Donors per Camp</th>
                </tr>
              </thead>
              <tbody>
                {bloodCampData.campLocations.map((location, index) => (
                  <tr 
                    key={index} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="border px-4 py-2">{location.name}</td>
                    <td className="border px-4 py-2">{location.camps}</td>
                    <td className="border px-4 py-2">{location.donors}</td>
                    <td className="border px-4 py-2">{Math.round(location.donors / location.camps)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border px-4 py-2">Total</td>
                  <td className="border px-4 py-2">{bloodCampData.totalCamps}</td>
                  <td className="border px-4 py-2">{bloodCampData.totalDonors}</td>
                  <td className="border px-4 py-2">{Math.round(bloodCampData.totalDonors / bloodCampData.totalCamps)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-gray-500 text-sm">
        <p>Last updated: March 29, 2025</p>
      </div>
    </div>
  );
};

export default BloodCampReport;