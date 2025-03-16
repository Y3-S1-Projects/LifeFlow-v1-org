"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, Edit, Save, X, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import useUser from "../../hooks/useUser";
import MapComponent from "@/app/components/Map";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Loader from "@/app/components/Loader";
import { useDarkMode } from "@/app/contexts/DarkModeContext";
import BloodDonationChatbot from "@/app/components/ChatBot";
// Blood types options
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface Settings {
  darkMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  donationReminders: boolean;
  bloodShortageAlerts: boolean;
  language: string;
  savedSuccess: boolean;
}

export default function DonorProfilePage() {
  const router = useRouter();
  const { user, loading, error, refetch } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { darkMode } = useDarkMode();
  const [, setSettings] = useState<Settings>({
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    donationReminders: true,
    bloodShortageAlerts: true,
    language: "english",
    savedSuccess: false,
  });
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const minDate = new Date(1920, 0, 1); // January 1, 1920
  const maxDate = new Date(2010, 11, 31); // December 31, 2010
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    bloodType: "",
    phoneNumber: "",
    weight: 0,
    nicNo: "",
    address: {
      street: "",
      city: "",
      state: "",
    },
    location: {
      latitude: 0,
      longitude: 0,
    },
    dateOfBirth: "",
    emergencyContact: {
      fullName: "",
      relationship: "",
      phone: "",
    },
  });
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      darkMode,
    }));
  }, [darkMode]);

  useEffect(() => {
    if (!loading && !user?.isEligible) {
      router.push("/donor/dashboard");
    }
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bloodType: user.bloodType || "",
        phoneNumber: user.phoneNumber || "",
        weight: user.weight || 0,
        nicNo: user.nicNo || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
        },
        location: {
          latitude: user.location?.coordinates?.[1] || 0,
          longitude: user.location?.coordinates?.[0] || 0,
        },
        dateOfBirth: user.dateOfBirth || "",
        emergencyContact: {
          fullName: user.emergencyContact?.fullName || "",
          relationship: user.emergencyContact?.relationship || "",
          phone: user.emergencyContact?.phone || "",
        },
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<
            string,
            string | number
          >),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: date.toISOString().split("T")[0],
      }));
    }
  };

  // const handleLocationSelect = (lat: number, lng: number): void => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     location: {
  //       latitude: lat,
  //       longitude: lng,
  //     },
  //   }));
  // };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form data to current user data
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bloodType: user.bloodType || "",
        phoneNumber: user.phoneNumber || "",
        weight: user.weight || 0,
        nicNo: user.nicNo || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
        },
        location: {
          latitude: user.location?.coordinates?.[1] || 0,
          longitude: user.location?.coordinates?.[0] || 0,
        },
        dateOfBirth: user.dateOfBirth || "",
        emergencyContact: {
          fullName: user.emergencyContact?.fullName || "",
          relationship: user.emergencyContact?.relationship || "",
          phone: user.emergencyContact?.phone || "",
        },
      });
    }
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!user?._id) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Get CSRF token first
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const csrfResponse = await axios.get(`${API_URL}/api/csrf-token`, {
        withCredentials: true,
      });
      const csrfToken = csrfResponse.data.csrfToken;
      console.log(csrfToken);
      // Prepare data for API
      const updateData = {
        fullName: formData.fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bloodType: formData.bloodType,
        phoneNumber: formData.phoneNumber,
        weight: Number(formData.weight),
        nicNo: formData.nicNo,
        address: formData.address,
        lat: formData.location.latitude,
        lng: formData.location.longitude,
        dateOfBirth: formData.dateOfBirth,
        emergencyContact: formData.emergencyContact,
      };

      // Call API to update user with CSRF token
      await axios.put(`${API_URL}/users/updateUser/${user._id}`, updateData, {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });

      // Refresh user data
      await refetch();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        {" "}
        <Card className="w-full max-w-lg p-6">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              Error Loading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
            <Button className="w-full mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <Card className="w-full max-w-lg p-6">
          <CardHeader>
            <CardTitle className="text-center">Profile Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Please log in to view your profile.</p>
            <Button
              className="w-full mt-4"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <Header />
      <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4 mx-auto space-y-6 flex flex-col">
        <BloodDonationChatbot />
        <Tabs defaultValue="profile" className="w-full">
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Basic Info */}
              <Card className="col-span-1">
                <CardHeader className="relative pb-2">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {user.firstName?.charAt(0) ||
                          user.fullName?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-center text-xl">
                    {user.fullName ||
                      `${user.firstName || ""} ${user.lastName || ""}`}
                  </CardTitle>
                  <div className="flex justify-center mt-2">
                    <Badge variant="outline" className="text-center">
                      {user.bloodType ? (
                        <span className="flex items-center font-semibold">
                          Blood Type:{" "}
                          <span className="ml-1 text-primary">
                            {user.bloodType}
                          </span>
                        </span>
                      ) : (
                        "Blood Type Not Set"
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Email
                      </h3>
                      <p>{user.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Phone
                      </h3>
                      <p>{user.phoneNumber || "Not provided"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </h3>
                      <p>
                        {user.dateOfBirth
                          ? format(new Date(user.dateOfBirth), "MMMM d, yyyy")
                          : "Not provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        NIC Number
                      </h3>
                      <p>{user.nicNo || "Not provided"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Weight
                      </h3>
                      <p>
                        {user.weight ? `${user.weight} kg` : "Not provided"}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Address
                      </h3>
                      <p className="mt-1">
                        {user.address?.street ? (
                          <>
                            {user.address.street}
                            <br />
                            {user.address.city}
                            {user.address.state
                              ? `, ${user.address.state}`
                              : ""}
                          </>
                        ) : (
                          "No address provided"
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Status
                      </h3>
                      <div className="flex mt-1 space-x-2">
                        {user.isVerified && (
                          <Badge variant="default">Verified</Badge>
                        )}
                        {user.isEligible && (
                          <Badge variant="secondary">Eligible Donor</Badge>
                        )}
                        {!user.isVerified && (
                          <Badge
                            variant="outline"
                            className="border-amber-500 text-amber-500"
                          >
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right column - Details & Emergency Contact */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Donor Information</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-6">
                    {isEditing ? (
                      /* Edit Mode */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select
                              value={formData.bloodType}
                              onValueChange={(value) =>
                                handleSelectChange("bloodType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                              <SelectContent>
                                {bloodTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nicNo">NIC Number</Label>
                            <Input
                              id="nicNo"
                              name="nicNo"
                              value={formData.nicNo}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              value={formData.weight}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.dateOfBirth &&
                                      "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {formData.dateOfBirth
                                    ? format(
                                        new Date(formData.dateOfBirth),
                                        "PPP"
                                      )
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                {/* <Calendar
                                  mode="single"
                                  selected={
                                    formData.dateOfBirth
                                      ? new Date(formData.dateOfBirth)
                                      : undefined
                                  }
                                  onSelect={handleDateChange}
                                  initialFocus
                                  captionLayout="dropdown"
                                  fromDate={minDate}
                                  toDate={maxDate}
                                /> */}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Address
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="street">Street Address</Label>
                              <Input
                                id="street"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="state">State/Province</Label>
                              <Input
                                id="state"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Location
                          </h3>
                          <div className="border rounded-md bg-slate-50 relative overflow-hidden ">
                            {/* Add overflow-hidden to contain the map and relative for proper positioning */}
                            {process.env.NEXT_PUBLIC_GOOGLE_API ? (
                              <MapComponent
                                apiKey={apiKey}
                                showNearbyCamps={false}
                                userLatitude={formData.location.latitude}
                                userLongitude={formData.location.longitude}
                                onLocationSelect={(lat, lng) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    location: {
                                      latitude: lat,
                                      longitude: lng,
                                    },
                                  }));
                                }}
                              />
                            ) : (
                              <div className="text-center h-full flex flex-col items-center justify-center">
                                <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                <p className="text-muted-foreground">
                                  Google Maps API key is missing
                                </p>
                                <p className="text-sm mt-2">
                                  Current coordinates:{" "}
                                  {formData.location.latitude.toFixed(6)},{" "}
                                  {formData.location.longitude.toFixed(6)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Emergency Contact
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="emergencyFullName">
                                Full Name
                              </Label>
                              <Input
                                id="emergencyFullName"
                                name="emergencyContact.fullName"
                                value={formData.emergencyContact.fullName}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="emergencyRelationship">
                                Relationship
                              </Label>
                              <Input
                                id="emergencyRelationship"
                                name="emergencyContact.relationship"
                                value={formData.emergencyContact.relationship}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="emergencyPhone">
                                Phone Number
                              </Label>
                              <Input
                                id="emergencyPhone"
                                name="emergencyContact.phone"
                                value={formData.emergencyContact.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Full Legal Name
                            </h3>
                            <p className="mt-1 font-medium">
                              {user.fullName ||
                                `${user.firstName || ""} ${
                                  user.lastName || ""
                                }`}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Last Donation Date
                            </h3>
                            <p className="mt-1 font-medium">
                              {user.lastDonationDate
                                ? format(
                                    new Date(user.lastDonationDate),
                                    "MMMM d, yyyy"
                                  )
                                : "No previous donations"}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Eligibility Status
                            </h3>
                            <div className="mt-1">
                              {user.isEligibleToDonate ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Eligible to Donate
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-red-200 text-red-700"
                                >
                                  Not Currently Eligible
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Profile Status
                            </h3>
                            <div className="mt-1">
                              {user.isProfileComplete ? (
                                <Badge
                                  variant="outline"
                                  className="border-green-200 text-green-700"
                                >
                                  Complete
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 text-amber-700"
                                >
                                  Incomplete
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Location
                          </h3>
                          {user.location?.coordinates ? (
                            <div className="border rounded-md bg-slate-50 relative overflow-hidden h-100">
                              {/* Increased height significantly to 320px */}
                              <MapComponent
                                apiKey={apiKey}
                                userLatitude={user.location.coordinates[1]}
                                userLongitude={user.location.coordinates[0]}
                                showNearbyCamps={false}
                                isClickable={false}
                                // Optional: You can set a higher default zoom to make location more visible
                                // defaultZoom={14} // If your MapComponent accepts this prop
                              />
                              <div className="absolute bottom-3 right-3 bg-white px-3 py-2 rounded-md shadow-md text-sm">
                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1 text-primary" />
                                  <span>
                                    {user.location.coordinates[1].toFixed(6)},{" "}
                                    {user.location.coordinates[0].toFixed(6)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="border rounded-md p-4 bg-slate-50 h-24 flex items-center justify-center">
                              <div className="text-center text-muted-foreground">
                                <MapPinIcon className="h-6 w-6 mx-auto mb-2" />
                                <p>No location information available</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Emergency Contact
                          </h3>
                          {user.emergencyContact?.fullName ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Name
                                </h4>
                                <p className="mt-1">
                                  {user.emergencyContact.fullName}
                                </p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Relationship
                                </h4>
                                <p className="mt-1">
                                  {user.emergencyContact.relationship ||
                                    "Not specified"}
                                </p>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Phone
                                </h4>
                                <p className="mt-1">
                                  {user.emergencyContact.phone ||
                                    "Not provided"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">
                              No emergency contact information provided
                            </div>
                          )}
                        </div>

                        {user.healthConditions &&
                          user.healthConditions.length > 0 && (
                            <>
                              <Separator />

                              <div>
                                <h3 className="text-lg font-semibold mb-3">
                                  Health Conditions
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {user.healthConditions.map(
                                    (condition, index) => (
                                      <Badge key={index} variant="outline">
                                        {condition}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                        {user.additionalInfo && (
                          <>
                            <Separator />

                            <div>
                              <h3 className="text-lg font-semibold mb-3">
                                Additional Information
                              </h3>
                              <p className="text-muted-foreground">
                                {user.additionalInfo}
                              </p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donation-history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  </div>
                  {user.donatedBefore === "yes" ? (
                    <p>Your donation history will appear here.</p>
                  ) : (
                    <p>
                      You haven&apos;t made any donations yet. Start your
                      journey as a donor today!
                    </p>
                  )}
                  <Button className="mt-4" variant="secondary">
                    Find Donation Opportunities
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer isDarkMode={darkMode} />
    </div>
  );
}
