import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Check, X } from "lucide-react";
import { API_BASE_URL } from "@/app/libs/utils";

// Define the structure of the User interface based on the response data
interface User {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bloodType: string;
  weight: number;
  isVerified: boolean;
  isEligibleToDonate: boolean;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for filtering

  useEffect(() => {
    axios
      .get<User[]>(`${API_BASE_URL}/users/allUsers`)
      .then((response) => {
        setUsers(response.data);
        setAllUsers(response.data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber.includes(searchTerm) ||
          user.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  const getBloodTypeClass = (bloodType: string) => {
    switch (bloodType) {
      case "A+":
        return "bg-red-50 text-red-700 border-red-200";
      case "A-":
        return "bg-red-50 text-red-700 border-red-200";
      case "B+":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "B-":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "AB+":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "AB-":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "O+":
        return "bg-green-50 text-green-700 border-green-200";
      case "O-":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
          User Management
        </h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none shadow-sm"
            />
          </div>
          {/*<button className="flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>*/}
          {/*}  <button className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            + Add User
          </button>*/}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {/*<th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID</th>*/}
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                Full Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                Email
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                Phone
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">
                Blood Type
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                Weight
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">
                Verified
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">
                Eligible
              </th>
              {/*<th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>*/}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 border-b border-gray-200 transition-colors"
              >
                {/*<td className="py-3 px-4 text-sm text-gray-500">{user._id.substring(0, 8)}...</td> */}
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-800">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </td>
                <td className="py-3 px-4 text-sm">{user.email}</td>
                <td className="py-3 px-4 text-sm">{user.phoneNumber}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getBloodTypeClass(
                      user.bloodType
                    )}`}
                  >
                    {user.bloodType}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-sm">
                  {user.weight} kg
                </td>
                <td className="py-3 px-4 text-center">
                  {user.isVerified ? (
                    <span className="inline-flex items-center justify-center p-1 rounded-full bg-green-100 text-green-600">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center p-1 rounded-full bg-amber-100 text-amber-600">
                      <X className="h-4 w-4" />
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {user.isEligibleToDonate ? (
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                      Eligible
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                      Ineligible
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {/*<button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>*/}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>Showing {users.length} users</div>
        {/*<div className="flex items-center space-x-2">
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 border rounded bg-red-50 text-red-600 font-medium border-red-200">1</button>
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-50">Next</button>
        </div>*/}
      </div>
    </div>
  );
};

export default UserTable;
