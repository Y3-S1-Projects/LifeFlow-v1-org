import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Download, Loader2, Check, X, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

// Type Definitions
interface Document {
  _id: string;
  documentType: string;
  originalName: string;
  fileType: string;
  uploadDate: Date;
  verified: boolean;
}

interface Organizer {
  _id: string;
  orgName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documents: Document[];
  eligibleToOrganize: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

const IneligibleOrganizersTable: React.FC = () => {
  const router = useRouter();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{ [key: string]: boolean }>({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Initialize axios instance
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Fetch CSRF Token
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const { data } = await apiClient.get('/api/csrf-token');
        setCsrfToken(data.csrfToken);
        apiClient.defaults.headers.common['X-CSRF-Token'] = data.csrfToken;
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, []);

  // Fetch Ineligible Organizers
  const fetchIneligibleOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/organizers/ineligible');
      
      const organizersWithDocuments = await Promise.all(
        response.data.organizers.map(async (organizer: Organizer) => {
          try {
            const documentsResponse = await apiClient.get('/organizers/documents', {
              params: { organizerId: organizer._id }
            });
            return {
              ...organizer,
              documents: documentsResponse.data.documents || [],
              status: organizer.eligibleToOrganize ? 'approved' : (organizer.status || 'pending')
            };
          } catch (docErr) {
            console.error(`Error fetching documents for organizer ${organizer._id}:`, docErr);
            return {
              ...organizer,
              documents: [],
              status: organizer.eligibleToOrganize ? 'approved' : (organizer.status || 'pending')
            };
          }
        })
      );

      setOrganizers(organizersWithDocuments);
      setFilteredOrganizers(organizersWithDocuments);
    } catch (err: any) {
      console.error('Error fetching organizers:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch organizers');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update Organizer Status
  const updateOrganizerStatus = async (organizerId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [organizerId]: true }));
      
      const response = await apiClient.patch(
        `/organizers/${organizerId}/status`,
        { 
          status: newStatus
        },
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
      );

      // Update local state with server response
      const updatedOrganizer = response.data.organizer;
      
      setOrganizers(prev =>
        prev.map(org =>
          org._id === organizerId ? { 
            ...org, 
            status: updatedOrganizer.status,
            eligibleToOrganize: updatedOrganizer.eligibleToOrganize
          } : org
        )
      );
      
      setFilteredOrganizers(prev =>
        prev.map(org =>
          org._id === organizerId ? { 
            ...org, 
            status: updatedOrganizer.status,
            eligibleToOrganize: updatedOrganizer.eligibleToOrganize
          } : org
        )
      );

      toast.success(`Organizer ${newStatus} successfully`);
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || `Failed to update organizer status`);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [organizerId]: false }));
    }
  };

  // Download Document Handler
  const handleDownloadDocument = async (documentId: string) => {
    if (downloading === documentId) return;
    
    try {
      setDownloading(documentId);
      
      const response = await apiClient.get(
        `/organizers/documents/${documentId}/download`,
        {
          responseType: 'blob',
          headers: {
            'X-CSRF-Token': csrfToken,
            'Accept': 'application/octet-stream'
          }
        }
      );

      if (!response.data || response.data.size === 0) {
        throw new Error('Empty document received');
      }

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document';
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data]);
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      }, 100);

      toast.success(`Downloaded: ${filename}`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error(err.response?.data?.message || 'Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  // Search Handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = organizers.filter(organizer =>
      organizer.orgName.toLowerCase().includes(term) ||
      organizer.email.toLowerCase().includes(term) ||
      organizer.phone.toLowerCase().includes(term) ||
      `${organizer.firstName} ${organizer.lastName}`.toLowerCase().includes(term)
    );

    setFilteredOrganizers(filtered);
  };

  // Fetch organizers on component mount
  useEffect(() => {
    fetchIneligibleOrganizers();
  }, []);

  // Render loading state
  if (loading) return (
    <div className="flex justify-center items-center h-full p-6">
      <Loader2 className="animate-spin h-8 w-8 text-red-600" />
    </div>
  );

  // Render error state
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p className="font-bold">Error</p>
      <p>{error}</p>
      <button
        onClick={fetchIneligibleOrganizers}
        className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );

  // Main render
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Search and Title Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Organizer Applications</h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Organizers Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrganizers.length > 0 ? (
              filteredOrganizers.map(organizer => (
                <tr key={organizer._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{organizer.orgName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {organizer.firstName} {organizer.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {organizer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {organizer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      {organizer.documents?.length > 0 ? (
                        organizer.documents.map(doc => (
                          <div key={doc._id} className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-xs">
                            <span className="capitalize">{doc.documentType.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <button
                              onClick={() => handleDownloadDocument(doc._id)}
                              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                              title="Download Document"
                              disabled={downloading === doc._id}
                            >
                              {downloading === doc._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">No documents</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {organizer.status === 'approved' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Approved
                      </span>
                    ) : organizer.status === 'rejected' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Rejected
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {organizer.status === 'pending' ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => updateOrganizerStatus(organizer._id, 'approved')}
                          disabled={updatingStatus[organizer._id]}
                          className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center"
                        >
                          {updatingStatus[organizer._id] ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => updateOrganizerStatus(organizer._id, 'rejected')}
                          disabled={updatingStatus[organizer._id]}
                          className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-md hover:bg-red-100 disabled:opacity-50 flex items-center"
                        >
                          {updatingStatus[organizer._id] ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Action completed</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? 'No matching organizers found' : 'No organizers available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>
          Showing {filteredOrganizers.length} of {organizers.length} organizers
        </div>
        <button
          onClick={fetchIneligibleOrganizers}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default IneligibleOrganizersTable;