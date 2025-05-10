import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "@/app/utils/auth";
import Header from "@/app/components/Header";

// Types
interface DonationCenter {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  organizer: string;
}

interface DonationFormData {
  donationDate: string;
  donationType: "Whole Blood" | "Plasma" | "Platelets" | "Double Red Cells";
  donationCenter: string;
  notes: string;
  postDonationIssues: string;
  pintsDonated: number;
}

interface User {
  _id: string;
  firstName: string;
  fullName: string;
  bloodType?: string;
  lastDonation?: string;
  email: string;
}

const AddDonationRecord: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  const [formData, setFormData] = useState<DonationFormData>({
    donationDate: new Date().toISOString().split("T")[0],
    donationType: "Whole Blood",
    donationCenter: "",
    notes: "",
    postDonationIssues: "None",
    pintsDonated: 1,
  });

  // Fetch organizer ID from token
  useEffect(() => {
    const fetchOrganizerId = async () => {
      try {
        const id = await getUserIdFromToken();
        if (id) {
          setOrganizerId(id);
        } else {
          // Handle missing token gracefully
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching organizer ID:", err);
        // Don't show error message here, just redirect to login
        router.push("/login");
      }
    };

    fetchOrganizerId();
  }, [router]);

  // Fetch donation centers when organizerId is available
  useEffect(() => {
    const fetchCamps = async () => {
      if (!organizerId) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/camps/get-camps/${organizerId}`
        );

        if (response.data?.camps?.length > 0) {
          setDonationCenters(response.data.camps);
          setFormData((prev) => ({
            ...prev,
            donationCenter: response.data.camps[0]._id,
          }));
        }
      } catch (err) {
        console.error("Failed to load donation centers:", err);
        setError("Unable to load donation centers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, [organizerId]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Search for user by ID
  const searchUser = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:3001/users/findUser/${userId}`
      );
      setUser(response.data);
    } catch (err) {
      setUser(null);
      setError("User not found. Please check the ID and try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pintsDonated" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      setError("Please enter a valid user ID");
      return;
    }

    if (!formData.donationCenter) {
      setError("Please select a donation center");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:3001/users/addUserDonationRecord/${userId}`,
        formData
      );
      setSuccess(true);
      setError(null);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          donationDate: new Date().toISOString().split("T")[0],
          donationType: "Whole Blood",
          donationCenter:
            donationCenters.length > 0 ? donationCenters[0]._id : "",
          notes: "",
          postDonationIssues: "None",
          pintsDonated: 1,
        });
        setUser(null);
        setUserId("");
      }, 2000);
    } catch (err) {
      setError("Failed to add donation record. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !donationCenters.length) {
    return (
      <div className="w-screen">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen bg-gray-50">
      <Header />

      <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-2/3 mx-auto space-y-6 flex flex-col">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold ml-3">Record Blood Donation</h1>
          </div>

          {/* Notification Messages */}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>Donation record added successfully!</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* User Search Section */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-medium mb-4 text-gray-700">
              <span className="mr-2">1.</span>Find Donor
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Donor ID"
                className="flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <button
                type="button"
                className="px-5 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={searchUser}
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {user && (
              <div className="mt-4 p-4 bg-white border rounded-md shadow-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Donor Found</span>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name:</p>
                    <p className="font-medium">
                      {user.fullName || user.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email:</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  {user.bloodType && (
                    <div>
                      <p className="text-sm text-gray-500">Blood Type:</p>
                      <p className="font-medium">{user.bloodType}</p>
                    </div>
                  )}
                  {user.lastDonation && (
                    <div>
                      <p className="text-sm text-gray-500">Last Donation:</p>
                      <p className="font-medium">
                        {new Date(user.lastDonation).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Donor ID:</p>
                    <p className="font-medium">{user._id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Donation Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-medium mb-4 text-gray-700">
              <span className="mr-2">2.</span>Donation Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donation Date */}
              <div>
                <label
                  htmlFor="donationDate"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Donation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="donationDate"
                  name="donationDate"
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.donationDate}
                  onChange={handleChange}
                />
              </div>

              {/* Donation Type */}
              <div>
                <label
                  htmlFor="donationType"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Donation Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="donationType"
                  name="donationType"
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.donationType}
                  onChange={handleChange}
                >
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Platelets">Platelets</option>
                  <option value="Double Red Cells">Double Red Cells</option>
                </select>
              </div>

              {/* Donation Center */}
              <div>
                <label
                  htmlFor="donationCenter"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Donation Center <span className="text-red-500">*</span>
                </label>
                <select
                  id="donationCenter"
                  name="donationCenter"
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.donationCenter}
                  onChange={handleChange}
                >
                  <option value="">Select a donation center</option>
                  {donationCenters.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name} - {center.address.street},{" "}
                      {center.address.city}
                    </option>
                  ))}
                </select>
                {donationCenters.length === 0 && !loading && (
                  <p className="text-sm text-red-600 mt-1">
                    No donation centers found. Please add a center first.
                  </p>
                )}
              </div>

              {/* Pints Donated */}
              <div>
                <label
                  htmlFor="pintsDonated"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Pints Donated <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="pintsDonated"
                  name="pintsDonated"
                  min="0.5"
                  step="0.1"
                  required
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.pintsDonated}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Post Donation Issues */}
            <div>
              <label
                htmlFor="postDonationIssues"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Post Donation Issues
              </label>
              <input
                type="text"
                id="postDonationIssues"
                name="postDonationIssues"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.postDonationIssues}
                placeholder="Any issues after donation? (Default: None)"
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.notes}
                placeholder="Any additional notes about this donation"
                onChange={handleChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto"
                onClick={() => router.push("/organizer/records")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto disabled:bg-red-300 disabled:cursor-not-allowed"
                disabled={!userId || !user || !formData.donationCenter}
              >
                Save Donation Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDonationRecord;
