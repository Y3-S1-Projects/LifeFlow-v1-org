import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Calendar, MapPin, Clock, Phone, Mail, Info } from "lucide-react";

// Define the structure of the Camp interface based on the response data
interface Camp {
  _id: string;
  name: string;
  description: string;
  operatingHours: string;
  status: string;
  availableDates: string[];
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: string;
  trackedBy: string[];
  reminders: any[];
  donationHistory: any[];
}

const CampTable: React.FC = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCamps, setAllCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<Camp[]>("http://localhost:3001/camps/all")
      .then((response) => {
        setCamps(response.data);
        setAllCamps(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching camps:", error);
        setError("Failed to load camps data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setCamps(allCamps);
    } else {
      const filtered = allCamps.filter(camp => 
        camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camp.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camp.address.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCamps(filtered);
    }
  }, [searchTerm, allCamps]);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming": return "bg-blue-50 text-blue-700 border-blue-200";
      case "active": return "bg-green-50 text-green-700 border-green-200";
      case "ongoing": return "bg-green-50 text-green-700 border-green-200";
      case "completed": return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading camps data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Blood Donation Camps</h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search camps..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </div>
      
      {camps.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Camp Details</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Contact</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Dates</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Info</th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => (
                <tr key={camp._id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">{camp.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{camp.description}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      {camp.operatingHours}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-700">{camp.address.street}</div>
                        <div className="text-xs text-gray-500">{camp.address.city}, {camp.address.postalCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm mb-1">
                      <Phone className="h-3 w-3 text-gray-400 mr-1" />
                      {camp.contact.phone}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Mail className="h-3 w-3 text-gray-400 mr-1" />
                      {camp.contact.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {camp.availableDates.map((date, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          {formatDate(date)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(camp.status)}`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-xs text-gray-500">
                      <div>Created: {new Date(camp.createdAt).toLocaleDateString()}</div>
                      <div className="mt-1">Trackers: {camp.trackedBy.length}</div>
                      <div className="mt-1">Donations: {camp.donationHistory.length}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center border border-gray-200 rounded-lg">
          <p className="text-gray-500">No camps found.</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>Showing {camps.length} camps</div>
      </div>
    </div>
  );
};

export default CampTable;