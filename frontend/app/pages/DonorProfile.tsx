import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Droplet,
  Calendar,
  Clock,
  Award,
  Heart,
  AlertCircle,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Edit,
  Save,
  X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useUser from "../hooks/useUser";
import Loader from "../components/Loader";

interface DonorProfile {
  name: string;
  bloodType: string;
  age: number;
  lastDonationDate: string;
  totalDonations: number;
  nextEligibleDate: string;
  medicalConditions: string[];
  address: string;
  contact: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const DonorProfileAdvanced = () => {
  const { user, loading, error } = useUser();
  const [editing, setEditing] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState<DonorProfile>({
    name: "John Doe",
    bloodType: "O+",
    age: 32,
    lastDonationDate: "2024-01-15",
    totalDonations: 8,
    nextEligibleDate: "2025-04-15",
    medicalConditions: ["None"],
    address: "123 Main St, City, Country",
    contact: "+1 234-567-8900",
    email: "john.doe@email.com",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 234-567-8901",
    },
  });

  const [editedProfile, setEditedProfile] = useState<DonorProfile>(profile);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileUpdate = () => {
    setProfile(editedProfile);
    setEditing(false);
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handlePasswordReset = () => {
    if (passwords.new !== passwords.confirm) {
      setSuccessMessage("New passwords do not match!");
      return;
    }
    setPasswords({ current: "", new: "", confirm: "" });
    setShowPasswordReset(false);
    setSuccessMessage("Password updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const calculateDaysUntilEligible = () => {
    const nextDate = new Date(profile.nextEligibleDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6 w-full mx-auto space-y-6 flex flex-col">
      <Header />
      <Tabs defaultValue="profile" className="w-full mt-4 mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex-1 text-center">
            Profile
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 text-center">
            Edit Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 text-center">
            Security
          </TabsTrigger>
        </TabsList>

        {successMessage && (
          <Alert className="mt-4 bg-green-50">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="profile">
          <Card className="shadow-lg min-h-[600px] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                  <p className="text-gray-500">Donor ID: {user?._id}</p>
                </div>
                <Badge className="text-lg px-4 py-2" variant="destructive">
                  <Droplet className="mr-2 h-4 w-4" />
                  {profile.bloodType}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Donation Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Total Donations</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {profile.totalDonations}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Last Donation</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {user?.lastDonationDate
                        ? new Date(user.lastDonationDate).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold">Days Until Eligible</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {calculateDaysUntilEligible()}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{user?.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-600">Address</p>
                        <p className="font-medium">{profile.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Emergency Contact
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium">
                          {profile.emergencyContact.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Relationship</p>
                        <p className="font-medium">
                          {profile.emergencyContact.relationship}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">
                          {profile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Medical Information
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium">Medical Conditions</p>
                        <ul className="list-disc list-inside mt-2">
                          {profile.medicalConditions.map((condition, index) => (
                            <li key={index} className="text-gray-700">
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Donation */}
                <div className="border-t pt-4">
                  <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-6 w-6 text-green-500" />
                      <div>
                        <p className="font-semibold">
                          Next Eligible Donation Date
                        </p>
                        <p className="text-green-700">
                          {new Date(
                            profile.nextEligibleDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">
                      {calculateDaysUntilEligible()} days remaining
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card className="shadow-lg min-h-[500px]">
            <CardHeader>
              <h2 className="text-xl font-bold">Edit Profile</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={user?.fullName}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={user?.email}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={user?.phoneNumber}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          contact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Blood Type</Label>
                    <Input
                      value={user?.bloodType}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          bloodType: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={editedProfile.address}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editedProfile.emergencyContact.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact: {
                              ...editedProfile.emergencyContact,
                              name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={editedProfile.emergencyContact.relationship}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact: {
                              ...editedProfile.emergencyContact,
                              relationship: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={editedProfile.emergencyContact.phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            emergencyContact: {
                              ...editedProfile.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditedProfile(profile);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleProfileUpdate}>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-lg min-h-[500px]">
            <CardHeader>
              <h2 className="text-xl font-bold">Security Settings</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        current: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        new: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirm: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswords({ current: "", new: "", confirm: "" });
                      setShowPasswordReset(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordReset}>Update Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default DonorProfileAdvanced;
