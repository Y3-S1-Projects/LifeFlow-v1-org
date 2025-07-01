"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCsrfToken } from "@/app/utils/Tokens";
import { API_BASE_URL } from "@/app/libs/utils";

// Camp interface based on your schema
interface Camp {
  _id: string;
  name: string;
  description: string;
  operatingHours: string;
  location: {
    type: string;
    coordinates: number[];
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  status: string;
  approvalStatus: string;
  approvalDetails: {
    approvedAt: Date | null;
    rejectionReason: string | null;
  };
  availableDates: string[];
  createdAt: string;
  organizer: {
    _id: string;
    orgName: string;
    email: string;
    contact: string;
  };
}

interface RejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Provide Rejection Reason
        </h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
        />
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason);
              setReason("");
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const CampApprovalTable: React.FC = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState<string | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/camps/all-camps`);
      setCamps(response.data);
    } catch (err) {
      setError("Failed to fetch pending camps");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campId: string) => {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setError("Failed to fetch CSRF token");
      return;
    }
    try {
      console.log("Approving camp with ID:", campId);
      await axios.put(
        `${API_BASE_URL}/camps/admin/approve/${campId}`,
        {},
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      setCamps(camps.filter((camp) => camp._id !== campId));
    } catch (err) {
      setError("Failed to approve camp");
      console.error(err);
    }
  };

  const openRejectionDialog = (campId: string) => {
    setSelectedCampId(campId);
    setRejectionDialogOpen(true);
  };

  const handleReject = async (reason: string) => {
    if (!selectedCampId) return;

    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setError("Failed to fetch CSRF token");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/camps/admin/reject/${selectedCampId}`,
        { rejectionReason: reason }, // Request body
        {
          headers: {
            "X-CSRF-Token": csrfToken, // Include CSRF token in headers
          },
          withCredentials: true, // Required for cookies/session
        }
      );
      setCamps(camps.filter((camp) => camp._id !== selectedCampId));
      setRejectionDialogOpen(false);
    } catch (err) {
      setError("Failed to reject camp");
      console.error(err);
    } finally {
      fetchCamps();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Camp Approval Management
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-full p-6">
          <div className="animate-spin h-8 w-8 text-red-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : camps.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No pending camps found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Camp Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operating Hours
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {camps.map((camp) => (
                <tr
                  key={camp._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{camp.name}</div>
                    <div className="text-sm text-gray-500">
                      {camp.description?.substring(0, 50)}
                      {camp.description?.length > 50 ? "..." : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {camp.address.street}, {camp.address.city},{" "}
                    {camp.address.postalCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{camp.contact.phone}</div>
                    <div>{camp.contact.email}</div>
                    <div className="font-medium text-gray-700 mt-1">
                      Organizer: {camp.organizer?.orgName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {camp.operatingHours}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {camp.status}
                      </span> */}
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {camp.approvalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(camp.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {camp.approvalStatus === "Pending" ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleApprove(camp._id)}
                          className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-md hover:bg-green-100 flex items-center"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectionDialog(camp._id)}
                          className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-md hover:bg-red-100 flex items-center"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {camp.approvalStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>Showing {camps.length} camps</div>
      </div>

      <RejectionDialog
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
};

export default CampApprovalTable;
