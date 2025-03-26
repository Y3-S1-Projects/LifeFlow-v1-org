import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Search, Trash2, Edit, Plus } from "lucide-react";
import { toast } from 'sonner';
import { getToken } from '@/app/utils/auth';

// Type Definitions
interface Address {
  street: string;
  city: string;
  state: string;
}

interface SupportAdmin {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  address: Address | string;
  nic: string;
}

interface FormData {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  nic: string;
}

const SupportAdminTable: React.FC = () => {
  const router = useRouter();
  const [supportAdmins, setSupportAdmins] = useState<SupportAdmin[]>([]); 
  const [filteredAdmins, setFilteredAdmins] = useState<SupportAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<SupportAdmin | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
    const [csrfToken, setCsrfToken] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    firstName: '',
    lastName: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: ''
    },
    nic: ''
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/admin';

  useEffect(() => {
    const fetchCsrfToken = async (): Promise<void> => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(data.csrfToken);
        console.log(csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  // Format Address
  const formatAddress = (address: Address | string): string => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    return parts.join(', ');
  };

  // Fetch Support Admins
  const fetchSupportAdmins = async () => {
    try {
      setLoading(true);


      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get(`${API_BASE_URL}/support-admins`, config);
      
      if (response.data?.success && response.data?.supportAdmins) {
        setSupportAdmins(response.data.supportAdmins);
        setFilteredAdmins(response.data.supportAdmins);
      } else {
        alert('Failed to load support admins');
      }
    } catch (err: any) {
      console.error('Error fetching support admins:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch support admins');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete Support Admin
  const handleDelete = async (id: string) => {
    try {


      const confirmDelete = window.confirm('Are you sure you want to delete this support admin?');
      if (!confirmDelete) return;

      const config = {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const response = await axios.delete(`${API_BASE_URL}/support-admins/${id}`, config);

      if (response.data?.success) {
        const updatedAdmins = supportAdmins.filter(admin => admin._id !== id);
        setSupportAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins);
        alert('Support admin deleted successfully');
      } else {
        alert(response.data?.message || 'Deletion failed');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      
      if (err.response?.status === 403) {
        alert('Permission denied: You are not authorized to delete support admins');
      } else if (err.response?.status === 401) {
        router.push('/login');
      } else {
        alert(`Delete failed: ${err.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  // Search Functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = supportAdmins.filter(admin => 
      admin.fullName.toLowerCase().includes(term) ||
      admin.email.toLowerCase().includes(term) ||
      (admin.nic && admin.nic.toLowerCase().includes(term)) ||
      formatAddress(admin.address).toLowerCase().includes(term)
    );

    setFilteredAdmins(filtered);
  };

  // Edit Functionality
  const handleEdit = (admin: SupportAdmin) => {
    setEditMode(true);
    setCurrentAdmin(admin);

    let addressObj = { street: '', city: '', state: '' };
    if (admin.address) {
      addressObj = typeof admin.address === 'string' 
        ? { street: admin.address, city: '', state: '' }
        : {
            street: admin.address.street || '',
            city: admin.address.city || '',
            state: admin.address.state || ''
          };
    }

    setFormData({
      fullName: admin.fullName || '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      address: addressObj,
      nic: admin.nic || ''
    });
  };

  // Handle Form Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update Support Admin
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json',
        },
        withCredentials: true

      };

      const response = await axios.put(
        `${API_BASE_URL}/support-admins/${currentAdmin!._id}`, 
        formData,
        config
      );

      if (response.data?.success && response.data?.admin) {
        const updatedAdmins = supportAdmins.map(admin => 
          admin._id === currentAdmin!._id ? response.data.admin : admin
        );
        
        setSupportAdmins(updatedAdmins);
        setFilteredAdmins(updatedAdmins);
        
        alert('Support admin updated successfully');
        
        // Reset form and edit mode
        setEditMode(false);
        setCurrentAdmin(null);
        setFormData({
          fullName: '',
          firstName: '',
          lastName: '',
          email: '',
          address: { street: '', city: '', state: '' },
          nic: ''
        });
      } else {
        alert('Failed to update support admin');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update support admin');
    }
  };

  // Cancel Edit
  const handleCancel = () => {
    setEditMode(false);
    setCurrentAdmin(null);
    setFormData({
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      address: { street: '', city: '', state: '' },
      nic: ''
    });
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchSupportAdmins();
  }, []);

  // Render Loading State
  if (loading) return (
    <div className="flex justify-center items-center h-full p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );

  // Render Error State
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Support Admins</h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search admins..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-sm border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 focus:outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => router.push('/support/register')}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Support Admin
          </button>
        </div>
      </div>
      
      {/* Rest of the component remains the same as in the previous implementation */}
      {/* Edit Mode Form */}
      {editMode && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          {/* Form implementation remains the same */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Support Admin</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input fields remain the same */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            <div className="flex justify-between mt-4">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Admin Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Full Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Address</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">NIC</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map(admin => (
              <tr key={admin._id} className="hover:bg-gray-50 border-b border-gray-200 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-800">{admin.fullName}</div>
                  <div className="text-xs text-gray-500">
                    {admin.firstName} {admin.lastName}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{admin.email}</td>
                <td className="py-3 px-4 text-sm">{formatAddress(admin.address)}</td>
                <td className="py-3 px-4 text-sm">{admin.nic || 'N/A'}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => handleEdit(admin)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(admin._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>
          Showing {filteredAdmins.length} of {supportAdmins.length} support admins
        </div>
      </div>
    </div>
  );
};

export default SupportAdminTable;