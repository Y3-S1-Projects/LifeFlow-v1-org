import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Organizer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orgName: string;
  isVerified: boolean;
  eligibleToOrganize: boolean;
}

const IneligibleOrganizersTable = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Base API configuration
  const API_BASE_URL = 'http://localhost:3001';
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Fetch organizers data
  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        // First get CSRF token if needed
        await api.get('/api/csrf-token');
        
        // Then fetch organizers
        const response = await api.get('/api/organizers/ineligible');
        if (response.data && Array.isArray(response.data.organizers)) {
          setOrganizers(response.data.organizers);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        const errorMsg = axios.isAxiosError(err)
          ? `Error ${err.response?.status}: ${err.response?.data?.message || err.message}`
          : 'Failed to fetch organizers';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  // Handle approving an organizer
  const handleApprove = async (organizerId: string) => {
    try {
      const response = await api.put(`/api/organizers/eligibility/${organizerId}`, {
        eligibleToOrganize: true
      });
      
      setOrganizers(organizers.filter(org => org._id !== organizerId));
      setSuccessMessage('Organizer approved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? `Approval failed: ${err.response?.data?.message || err.message}`
        : 'Approval failed';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle deleting an organizer
  const handleDelete = async (organizerId: string) => {
    if (!window.confirm('Are you sure you want to delete this organizer?')) return;

    try {
      await api.delete(`/api/organizers/${organizerId}`);
      setOrganizers(organizers.filter(org => org._id !== organizerId));
      setSuccessMessage('Organizer deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? `Deletion failed: ${err.response?.data?.message || err.message}`
        : 'Deletion failed';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Ineligible Organizers</h2>
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{successMessage}</p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizers.length > 0 ? (
                organizers.map((organizer) => (
                  <tr key={organizer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {organizer.firstName.charAt(0)}{organizer.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {organizer.firstName} {organizer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{organizer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{organizer.orgName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{organizer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        organizer.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {organizer.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(organizer._id)}
                          className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(organizer._id)}
                          className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No ineligible organizers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IneligibleOrganizersTable;