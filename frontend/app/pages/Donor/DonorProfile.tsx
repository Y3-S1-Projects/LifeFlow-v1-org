import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
  LockKeyhole,
  Shield,
  HeartPulse,
  UserCog,
  Stethoscope,
  CheckCircle,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useUser from "../../hooks/useUser";
import Loader from "../../components/Loader";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/app/components/RouteGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(
        `/donor/login?message=${encodeURIComponent("Login to access")}`
      );
    } else if (!loading && user?.role !== "User") {
      router.replace(
        `/unauthorized?message=${encodeURIComponent(
          "Insufficient permissions"
        )}`
      );
    } else if (!loading && !user?.isEligible) {
      router.replace(
        `/donor/dashboard?message=${encodeURIComponent(
          "Complete your profile to access more features"
        )}`
      );
    }
  }, [user, loading, router]);

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
    <RouteGuard requiredRoles={["User"]}>
      <div className="w-full">
        <Header />
        <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4 mx-auto space-y-6 flex flex-col">
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
              <Alert className="mt-4 bg-green-50 border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Header Card */}
                <Card className="md:col-span-3 shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-red-400 to-red-600 top-0"></div>
                  <CardHeader className="pt-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                          {user?.fullName}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Donor ID: {user?._id}
                        </p>
                      </div>
                      <Badge className="px-4 py-2 bg-red-50 text-red-700 border-red-200">
                        <Droplet className="mr-2 h-4 w-4 text-red-500" />
                        {user?.bloodType && user.bloodType !== "not sure"
                          ? user.bloodType
                          : "Blood Type not set"}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Donation Stats Cards */}
                <Card className="shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Total Donations
                    </CardTitle>
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-700">
                      {profile.totalDonations}
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">Lives saved</p>
                      <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {profile.totalDonations * 3}+
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-green-400 to-green-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Last Donation
                    </CardTitle>
                    <div className="p-2 bg-green-50 rounded-full">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-700">
                      {user?.lastDonationDate
                        ? new Date(user.lastDonationDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )
                        : new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">Thank you!</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Days Until Eligible
                    </CardTitle>
                    <div className="p-2 bg-orange-50 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-700">
                      {calculateDaysUntilEligible()}
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {calculateDaysUntilEligible() <= 0
                          ? "Eligible now!"
                          : "Days remaining"}
                      </p>
                      {calculateDaysUntilEligible() <= 0 ? (
                        <Badge className="ml-2 bg-green-50 text-green-700 border-green-200 text-xs">
                          Ready!
                        </Badge>
                      ) : (
                        <Badge className="ml-2 bg-orange-50 text-orange-700 border-orange-200 text-xs">
                          Waiting
                        </Badge>
                      )}
                    </div>
                    {calculateDaysUntilEligible() <= 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-orange-300 text-orange-600 hover:bg-orange-50 flex items-center justify-center"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="md:col-span-2 shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-indigo-400 to-indigo-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-medium text-gray-800">
                      Contact Information
                    </CardTitle>
                    <div className="p-2 bg-indigo-50 rounded-full">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {user?.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="font-medium text-gray-800">
                            {profile.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-red-400 to-red-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-medium text-gray-800">
                      Emergency Contact
                    </CardTitle>
                    <div className="p-2 bg-red-50 rounded-full">
                      <HeartPulse className="h-4 w-4 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium text-gray-800">
                          {profile.emergencyContact.name}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Relationship</p>
                        <p className="font-medium text-gray-800">
                          {profile.emergencyContact.relationship}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800">
                          {profile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card className="md:col-span-3 shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-medium text-gray-800">
                      Medical Information
                    </CardTitle>
                    <div className="p-2 bg-purple-50 rounded-full">
                      <Stethoscope className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">
                            Medical Conditions
                          </p>
                          {profile.medicalConditions.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                              {profile.medicalConditions.map(
                                (condition, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-700 flex items-center"
                                  >
                                    <div className="h-1.5 w-1.5 bg-purple-500 rounded-full mr-2"></div>
                                    {condition}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-gray-500 mt-1">
                              No medical conditions reported
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Donation */}
                <Card className="md:col-span-3 shadow-lg overflow-hidden border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute h-1 w-full bg-gradient-to-r from-green-400 to-green-600 top-0"></div>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-medium text-gray-800">
                      Next Eligible Donation
                    </CardTitle>
                    <div className="p-2 bg-green-50 rounded-full">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-green-50 to-white p-6 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Next Eligible Date
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {new Date(
                              profile.nextEligibleDate
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge className="px-4 py-2 bg-green-100 border-green-200">
                          <Clock className="mr-2 h-4 w-4 text-green-700" />
                          {calculateDaysUntilEligible() <= 0
                            ? "Eligible now!"
                            : `${calculateDaysUntilEligible()} days remaining`}
                        </Badge>
                        {calculateDaysUntilEligible() <= 0 && (
                          <Button className="ml-3 bg-green-600 hover:bg-green-700">
                            Schedule Donation
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="edit">
              <Card className="shadow-lg overflow-hidden border-gray-100">
                <div className="absolute h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 top-0"></div>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <UserCog className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Edit Profile
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">Full Name</Label>
                        <Input
                          className="border-gray-300 focus:border-blue-500"
                          value={user?.fullName}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Email</Label>
                        <Input
                          className="border-gray-300 focus:border-blue-500"
                          value={user?.email}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Phone</Label>
                        <Input
                          className="border-gray-300 focus:border-blue-500"
                          value={user?.phoneNumber}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              contact: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-700">Blood Type</Label>
                        <Select
                          value={user?.bloodType}
                          onValueChange={(value) =>
                            setEditedProfile({
                              ...editedProfile,
                              bloodType: value,
                            })
                          }
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="not sure">Not Sure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Address</Label>
                      <Input
                        className="border-gray-300 focus:border-blue-500"
                        value={editedProfile.address}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-red-50 rounded-full">
                          <HeartPulse className="h-4 w-4 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Emergency Contact
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">Name</Label>
                          <Input
                            className="border-gray-300 focus:border-blue-500"
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
                        <div className="space-y-2">
                          <Label className="text-gray-700">Relationship</Label>
                          <Input
                            className="border-gray-300 focus:border-blue-500"
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
                        <div className="space-y-2">
                          <Label className="text-gray-700">Phone</Label>
                          <Input
                            className="border-gray-300 focus:border-blue-500"
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

                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setEditedProfile(profile);
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleProfileUpdate}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="shadow-lg overflow-hidden border-gray-100">
                <div className="absolute h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600 top-0"></div>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-50 rounded-full">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      Security Settings
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-50 rounded-lg mb-6">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">
                            Password Protection
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Update your password regularly to keep your account
                            secure.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700">
                          Current Password
                        </Label>
                        <Input
                          type="password"
                          className="border-gray-300 focus:border-purple-500"
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
                        <Label className="text-gray-700">New Password</Label>
                        <Input
                          type="password"
                          className="border-gray-300 focus:border-purple-500"
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
                        <Label className="text-gray-700">
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          className="border-gray-300 focus:border-purple-500"
                          value={passwords.confirm}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirm: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setPasswords({ current: "", new: "", confirm: "" });
                          setShowPasswordReset(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handlePasswordReset}
                      >
                        <LockKeyhole className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <Footer isDarkMode={false} />
      </div>
    </RouteGuard>
  );
};

export default DonorProfileAdvanced;
