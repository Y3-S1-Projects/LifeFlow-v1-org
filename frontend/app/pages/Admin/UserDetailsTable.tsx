import React, { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {
    axios
      .get<User[]>('http://localhost:3001/users/allUsers') // Replace with your actual API endpoint
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Blood Type</th>
            <th className="border p-2">Weight</th>
            <th className="border p-2">Verified</th>
            <th className="border p-2">Eligible</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-100">
              <td className="border p-2">{user._id}</td>
              <td className="border p-2">{user.fullName}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.phoneNumber}</td>
              <td className="border p-2">{user.bloodType}</td>
              <td className="border p-2">{user.weight}</td>
              <td className="border p-2">{user.isVerified ? "Yes" : "No"}</td>
              <td className="border p-2">{user.isEligibleToDonate ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
