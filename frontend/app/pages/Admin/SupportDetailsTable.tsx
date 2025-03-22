import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the type for support admins
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
//support
const SupportAdminTable = () => {
  const [supportAdmins, setSupportAdmins] = useState<SupportAdmin[]>([]); // Explicitly type supportAdmins
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Type error as string or null
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<SupportAdmin | null>(null); // Explicitly type currentAdmin
  const [formData, setFormData] = useState({
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

  const API_BASE_URL = 'http://localhost:3001/admin';

  const formatAddress = (address: { street: any; city: any; state: any; }) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    return parts.join(', ');
  };

  const fetchSupportAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/support-admins`);
      if (response.data && response.data.success && response.data.supportAdmins) {
        setSupportAdmins(response.data.supportAdmins);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setSupportAdmins(response.data?.supportAdmins || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching support admins:', err);
      setError(`Failed to fetch support admins: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this support admin?')) {
      try {
        await axios.delete(`${API_BASE_URL}/support-admins/${id}`);
        setSupportAdmins(supportAdmins.filter(admin => admin._id !== id));
      } catch (err) {
        console.error('Error deleting support admin:', err);
        setError(`Failed to delete support admin: ${(err as Error).message}`);
      }
    }
  };

  const handleEdit = (admin: SupportAdmin) => { // Corrected type for admin
    setEditMode(true);
    setCurrentAdmin(admin);

    let addressObj = { street: '', city: '', state: '' };
    if (admin.address) {
      if (typeof admin.address === 'string') {
        addressObj = { street: admin.address, city: '', state: '' };
      } else {
        addressObj = {
          street: admin.address.street || '',
          city: admin.address.city || '',
          state: admin.address.state || ''
        };
      }
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

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleUpdate = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/support-admins/${currentAdmin!._id}`, formData); // Added non-null assertion
      if (response.data && response.data.success && response.data.admin) {
        setSupportAdmins(supportAdmins.map(admin => admin._id === currentAdmin!._id ? response.data.admin : admin));
        setEditMode(false);
        setCurrentAdmin(null);
        setFormData({
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
      } else {
        setError('Unexpected response format when updating support admin');
      }
    } catch (err) {
      console.error('Error updating support admin:', err);
      setError(`Failed to update support admin: ${(err as Error).message}`);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentAdmin(null);
    setFormData({
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
  };

  useEffect(() => {
    fetchSupportAdmins();
  }, []);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Support Admins</h2>
      {editMode ? (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">Edit Support Admin</h3>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {/* Address fields */}
              <div>
                <label className="block text-sm font-medium mb-1">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
            </div>
          </form>
        </div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Full Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {supportAdmins.map(admin => (
              <tr key={admin._id}>
                <td className="border border-gray-300 px-4 py-2">{admin.fullName}</td>
                <td className="border border-gray-300 px-4 py-2">{admin.email}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button onClick={() => handleEdit(admin)} className="px-4 py-2 bg-yellow-500 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(admin._id)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SupportAdminTable;
