import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCsrfToken } from "@/app/utils/Tokens";


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

const RejectionDialog: React.FC<RejectionDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Provide Rejection Reason</h3>
        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-4"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-red-300"
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
  
  const fetchPendingCamps = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/camps/admin/pending");
      setCamps(response.data.camps);
    } catch (err) {
      setError("Failed to fetch pending camps");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCamps = async () =>{
    try{
      setLoading(true);
      const response = await axios.get("http://localhost:3001/camps/all-camps");
      setCamps(response.data);
    } catch (err) {
      setError("Failed to fetch pending camps");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (campId: string) => {
    const csrfToken = await getCsrfToken();
    if (!csrfToken) {
      setError("Failed to fetch CSRF token");
      return;
    }
    try {
      console.log("Approving camp with ID:", campId);
      await axios.put(
        `http://localhost:3001/camps/admin/approve/${campId}`,
        {}, // empty body if you don't need to send any data
        {
          headers: {
            'X-CSRF-Token': csrfToken // Include CSRF token in headers
          },
          withCredentials: true // Important for cookies/sessions
        }
      );
      setCamps(camps.filter(camp => camp._id !== campId));
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
        `http://localhost:3001/camps/admin/reject/${selectedCampId}`,
        { rejectionReason: reason }, // Request body
        {
          headers: {
            'X-CSRF-Token': csrfToken // Include CSRF token in headers
          },
          withCredentials: true // Required for cookies/session
        }
      );
      setCamps(camps.filter(camp => camp._id !== selectedCampId));
      setRejectionDialogOpen(false);
    } catch (err) {
      setError("Failed to reject camp");
      console.error(err);
    }finally{
      fetchCamps();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center p-4">Loading camps...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Camp Approval Management</h2>
      
      {camps.length === 0 ? (
        <div className="text-center p-4">No pending camps found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Camp Name</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Operating Hours</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => (
                <tr key={camp._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {camp.name}
                    <div className="text-sm text-gray-500">{camp.description?.substring(0, 50)}{camp.description?.length > 50 ? '...' : ''}</div>
                  </td>
                  <td className="px-4 py-2">
                    {camp.address.street}, {camp.address.city}, {camp.address.postalCode}
                  </td>
                  <td className="px-4 py-2">
                    <div>{camp.contact.phone}</div>
                    <div className="text-sm text-gray-500">{camp.contact.email}</div>
                    <div className="text-sm font-medium">
                      Organizer: {camp.organizer?.orgName}
                    </div>
                  </td>
                  <td className="px-4 py-2">{camp.operatingHours}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                      {camp.status}
                    </span>
                    <div className="mt-1">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {camp.approvalStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{formatDate(camp.createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col space-y-2">
                      {camp.approvalStatus === "Pending" ? (
                        <>
                      <button 
                      onClick={() => handleApprove(camp._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => openRejectionDialog(camp._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>    </>                  ): <span className="text-gray-500">{camp.approvalStatus}</span>}

                    </div>
                  </td>
                </tr>
              ))} 
            </tbody>
          </table>
        </div>
      )}

      <RejectionDialog 
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleReject}
      />
    </div>
  );
};

export default CampApprovalTable;
