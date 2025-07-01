import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  MapPin,
  Calendar,
  Clock,
  Hospital,
  X,
  Search,
  Navigation,
  CalendarClock,
  Map,
  MoreVertical,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelConfirmationModal } from "@/app/components/CancelConfirmationModal";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import MapComponent from "../../components/Map";
import useUser from "../../hooks/useUser";
import Header from "../../components/Header";
import RescheduleModal from "../../components/RescheduleModal";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";
import { useRouter, useSearchParams } from "next/navigation";
import TimeSelector from "../../components/TimeSelector";
import { getToken, getUserIdFromToken } from "../../utils/auth";
import { RouteGuard } from "../../components/RouteGuard";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BloodDonationChatbot from "@/app/components/ChatBot";
import { API_BASE_URL } from "@/app/libs/utils";

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface Contact {
  phone: string;
  email: string;
}
interface AxiosErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errorType?: string;
    };
  };
}

interface Location {
  type: string;
  coordinates: number[];
}

interface DonationHistory {
  donorName: string;
  donationDate: Date;
  amount: number;
  remarks: string;
}

interface Camp {
  _id: string;
  name: string;
  description: string;
  operatingHours: string;
  location: Location;
  address: Address;
  status: "Open" | "Closed" | "Full" | "Upcoming";
  availableDates: Date[];
  contact: Contact;
  donationHistory: DonationHistory[];
  createdAt: Date;
  distance?: number;
  distanceUnit?: string;
}

interface Appointment {
  _id: string;
  userId: string;
  campId: Camp; // This is now the full camp object due to .populate()
  date: string;
  time: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SearchParamsHandlerProps {
  onMessageFound: (message: string) => void;
}

const SearchParamsHandler = ({ onMessageFound }: SearchParamsHandlerProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toastShown, setToastShown] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message && !toastShown) {
      const timer = setTimeout(() => {
        toast.success(message);
        toastShownRef.current = true;
        router.replace("/donor/appointments");
        setToastShown(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, toastShown, router]);

  return null;
};

const BloodDonationAppointments: React.FC = () => {
  const { user } = useUser();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedCampId, setSelectedCampId] = useState<string>("");
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredCamps, setFilteredCamps] = useState<Camp[]>([]);
  const [showMap, setShowMap] = useState<boolean>(false); // State to control map visibility
  const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
    return typeof error === "object" && error !== null && "response" in error;
  };
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // Ensure user is available before proceeding

    if (!user.isEligible) {
      setLoading(true);
      router.replace(
        `/donor/dashboard?message=${encodeURIComponent(
          "Complete your profile to access more features"
        )}`
      );
      return;
    }

    const getLocation = () => {
      if (user.location) {
        const { location } = user;
        const [longitude, latitude] = location?.coordinates || [null, null];

        if (typeof latitude === "number" && typeof longitude === "number") {
          setLatitude(latitude);
          setLongitude(longitude);
          fetchNearbyCamps(latitude, longitude, 20);
          return; // Prevents browser geolocation from running
        } else {
          console.log(
            "Invalid coordinates in user profile, falling back to browser geolocation"
          );
        }
      }

      // If no valid stored location, use browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchNearbyCamps(latitude, longitude, 50);
          },
          () => {
            toast.error("Unable to retrieve your location");
            setLoading(false);
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser");
        setLoading(false);
      }
    };

    const fetchNearbyCamps = async (
      lat: number,
      lng: number,
      radius: number
    ) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/camps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby camps");
        }

        const data = await response.json();
        setCamps(data);
        setLoading(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch nearby camps"
        );
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      getLocation();
    }, 500);

    return () => clearTimeout(timeout); // Cleanup function to prevent memory leaks
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCamps(camps);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = camps.filter(
      (camp) =>
        camp.name.toLowerCase().includes(query) ||
        camp.address.city.toLowerCase().includes(query) ||
        camp.address.street.toLowerCase().includes(query) ||
        camp.address.postalCode.toLowerCase().includes(query)
    );

    setFilteredCamps(filtered);
  }, [searchQuery, camps]);

  useEffect(() => {
    const fetchCsrfToken = async (): Promise<void> => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
          withCredentials: true,
        });
        setCsrfToken(data.csrfToken);
        axios.defaults.headers.common["X-CSRF-Token"] = data.csrfToken;
      } catch (err) {
        console.error("CSRF token fetch error:", err);
        toast.error("Failed to fetch security token");
      }
    };

    fetchCsrfToken();
  }, [API_BASE_URL]);

  // useEffect(() => {
  //   const message = searchParams.get("message");
  //   if (message && !toastShownRef.current) {
  //     const timer = setTimeout(() => {
  //       toast.success(message);
  //       toastShownRef.current = true;
  //       router.replace("/donor/dashboard"); // Clean URL
  //     }, 500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [searchParams]);

  useEffect(() => {
    const fetchAppointments = async (): Promise<void> => {
      try {
        const userId = await getUserIdFromToken();

        if (!userId) {
          toast.error("User not authenticated");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/appointments/getByUser/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        toast.error((error as Error).message || "Error fetching appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [API_BASE_URL]);

  useEffect(() => {
    setAppointmentDate("");
    setAppointmentTime("");
  }, [selectedCamp]);

  const handleCampSelect = (campId: string) => {
    setSelectedCampId(campId);
    const camp = camps.find((c) => c._id === campId);
    setSelectedCamp(camp || null);
  };
  const handleCampClick = (camp: Camp) => {
    setSelectedCamp(camp);
    setSelectedCampId(camp._id);
  };

  const handleRescheduleAppointment = async (
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/reschedule/${appointmentId}`,
        { date: newDate, time: newTime },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Update local state
        setAppointments((currentAppointments) =>
          currentAppointments.map((app) =>
            app._id === appointmentId
              ? { ...app, date: newDate, time: newTime }
              : app
          )
        );
        toast.success("Appointment rescheduled successfully");
      }
    } catch (_) {
      toast.error("Failed to reschedule appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/cancel/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setAppointments(
          appointments.filter((app) => app._id !== appointmentId)
        );
        toast.success("Appointment cancelled successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("An error occurred while cancelling your appointment");
    }
  };

  const handleAppointmentBooking = async () => {
    // Validate inputs first
    if (!selectedCamp || !appointmentDate || !appointmentTime) {
      toast.error("Please complete all booking details", {
        icon: "ℹ️",
        style: {
          background: "#FEF3C7",
          border: "1px solid #F59E0B",
          color: "#92400E",
        },
      });
      return;
    }

    try {
      setLoading(true);

      // First check local state for existing appointments
      const activeAppointments = appointments.filter(
        (app) => app.status === "Pending" || app.status === "Confirmed"
      ).length;

      if (activeAppointments >= 3) {
        throw new Error("APPOINTMENT_LIMIT_REACHED");
      }

      const response = await axios.post(
        `${API_BASE_URL}/appointments/create`,
        {
          userId: user?._id,
          campId: selectedCamp._id,
          date: appointmentDate,
          time: appointmentTime,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success("Appointment booked successfully!", {
          icon: "✅",
          style: {
            background: "#DCFCE7",
            border: "1px solid #22C55E",
            color: "#166534",
          },
        });
        // Only reset the form fields without refreshing
        setAppointmentDate("");
        setAppointmentTime("");

        // Optionally update the appointments list without refresh
        const updatedAppointments = await axios.get(
          `${API_BASE_URL}/appointments/getByUser/${user?._id}`
        );
        setAppointments(updatedAppointments.data);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle our locally thrown error
        if (error.message === "APPOINTMENT_LIMIT_REACHED") {
          toast.error("You've reached the maximum of 3 active appointments", {
            icon: "⚠️",
            style: {
              background: "#FFEDD5",
              border: "1px solid #F97316",
              color: "#9A3412",
            },
          });
          return;
        }
      }

      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        switch (errorData?.errorType) {
          case "APPOINTMENT_LIMIT_REACHED":
            toast.error("You've reached the maximum of 3 active appointments", {
              icon: "⚠️",
              style: {
                background: "#FFEDD5",
                border: "1px solid #F97316",
                color: "#9A3412",
              },
            });
            break;

          case "ALREADY_BOOKED":
            toast.error("You already have an appointment at this location", {
              icon: "ℹ️",
              style: {
                background: "#E0F2FE",
                border: "1px solid #0EA5E9",
                color: "#075985",
              },
            });
            break;

          case "CAMP_NOT_FOUND":
            toast.error("This donation camp is no longer available", {
              icon: "❌",
              style: {
                background: "#FEE2E2",
                border: "1px solid #EF4444",
                color: "#991B1B",
              },
            });
            setSelectedCamp(null);
            setSelectedCampId("");
            break;

          default:
            toast.error(errorData?.message || "Failed to book appointment", {
              icon: "⚠️",
              style: {
                background: "#FEE2E2",
                border: "1px solid #EF4444",
                color: "#991B1B",
              },
            });
        }
      } else {
        // Handle network errors or other exceptions
        toast.error(
          "Connection issue. Please check your network and try again.",
          {
            icon: "📶",
            style: {
              background: "#F3F4F6",
              border: "1px solid #9CA3AF",
              color: "#4B5563",
            },
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const availableDates = useMemo(() => {
    if (!selectedCamp?.availableDates) return [];
    return selectedCamp.availableDates.map((date) => ({
      value: new Date(date).toISOString().split("T")[0],
      label: new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }));
  }, [selectedCamp]);

  const getStatusColor = (status: Camp["status"]) => {
    const colors = {
      Open: "text-green-600",
      Closed: "text-red-600",
      Full: "text-orange-600",
      Upcoming: "text-blue-600",
    };
    return colors[status] || "text-gray-600";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }

  const fallbackLatitude = latitude ?? 6.9271;
  const fallbackLongitude = longitude ?? 79.8612;

  return (
    <RouteGuard requiredRoles={["User"]}>
      <div className="w-full bg-gray-50">
        <Header />
        <div className="min-h-screen p-4 md:p-6 w-full md:w-4/5 lg:w-3/4 mx-auto space-y-6 flex flex-col">
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                padding: "16px",
                borderRadius: "8px",
              },
            }}
          />
          <BloodDonationChatbot />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Blood Donation Appointments
              </h1>
              <p className="text-gray-600 mt-1">
                Find and schedule your next life-saving donation
              </p>
            </div>
            <Button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              {showMap ? <X className="h-4 w-4" /> : <Map />}
              {showMap ? "Hide Map" : "View Map"}
            </Button>
          </div>
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-700">
                Not seeing accurate donation centers near you? Check if your
                location is set correctly!{" "}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => router.push("/donor/profile")}
            >
              Update Location
            </Button>
          </div>

          {showMap && (
            <Card className="w-full overflow-hidden mb-6 shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="h-96">
                  <MapComponent
                    userLatitude={fallbackLatitude}
                    userLongitude={fallbackLongitude}
                    apiKey={apiKey}
                    showNearbyCamps={true}
                    selectedCampId={selectedCampId}
                    onCampSelect={handleCampSelect}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Nearest Camps Section */}
            <Card className="shadow-md hover:shadow-lg transition-shadow border-gray-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Donation Centers
                  </CardTitle>
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0">
                    {camps.length} Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by name or location"
                    className="w-full bg-transparent border-none focus:outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                </div>
                <div className="max-h-[460px] overflow-y-auto p-2">
                  {filteredCamps.length > 0 ? (
                    filteredCamps.map((camp) => (
                      <div
                        key={camp._id}
                        className={`border p-4 mb-2 rounded-lg cursor-pointer transition-all hover:border-red-200 ${
                          selectedCampId === camp._id
                            ? "bg-red-50 border-red-300"
                            : "bg-white"
                        }`}
                        onClick={() => handleCampClick(camp)}
                      >
                        <div className="flex items-center mb-2 justify-between">
                          <div className="flex items-center">
                            <Hospital className="mr-2 text-red-500" />
                            <h3 className="font-semibold">{camp.name}</h3>
                          </div>
                          <Badge className={`${getStatusColor(camp.status)}`}>
                            {camp.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {camp.description}
                        </p>

                        <div className="flex flex-col space-y-2 mt-3">
                          <div className="flex items-start gap-2">
                            <MapPin
                              className="text-red-400 flex-shrink-0 mt-0.5"
                              size={16}
                            />
                            <p className="text-sm">
                              {camp.address.street}, {camp.address.city}{" "}
                              {camp.address.postalCode}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <Clock className="mr-2 text-red-400" size={16} />
                            <span className="text-sm">
                              {camp.operatingHours}
                            </span>
                          </div>

                          {camp.distance && (
                            <div className="flex items-center">
                              <Navigation
                                className="mr-2 text-red-400"
                                size={16}
                              />
                              <span className="text-sm font-medium">
                                {camp.distance} {camp.distanceUnit} away
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-dashed flex flex-wrap gap-2">
                          {camp.availableDates
                            .slice(0, 3)
                            .map((date, index) => (
                              <Badge
                                key={`${date}-${index}`} // Ensures uniqueness
                                variant="outline"
                                className="bg-gray-50 border-gray-200 text-gray-700 text-xs"
                              >
                                {new Date(date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Badge>
                            ))}

                          {camp.availableDates.length > 3 && (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 border-gray-200 text-gray-700 text-xs"
                            >
                              +{camp.availableDates.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No matching centers found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try a different search term or clear your search
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Booking Section */}
            <Card className="shadow-md border-gray-200 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-red-500" />
                  Book Your Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                {selectedCamp ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Hospital className="text-blue-500" size={18} />
                        <p className="font-medium text-blue-800">
                          {selectedCamp.name}
                        </p>
                      </div>
                      <p className="text-sm text-blue-700 mt-1 pl-6">
                        {selectedCamp.address.street},{" "}
                        {selectedCamp.address.city}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date:
                      </label>
                      <select
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Choose a date</option>
                        {availableDates.map((date) => (
                          <option key={date.value} value={date.value}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <TimeSelector
                        operatingHours={
                          selectedCamp?.operatingHours || "9:00 AM - 5:00 PM"
                        }
                        appointmentTime={appointmentTime}
                        setAppointmentTime={setAppointmentTime}
                        appointmentDate={appointmentDate}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">
                      Please select a donation center
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Choose from one of the centers on the left to schedule
                      your appointment
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="p-6 bg-gray-50 border-t mt-auto">
                <Button
                  onClick={handleAppointmentBooking}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 flex items-center justify-center gap-2"
                  disabled={
                    !selectedCamp ||
                    !appointmentDate ||
                    !appointmentTime ||
                    (selectedCamp?.status !== "Open" &&
                      selectedCamp?.status !== "Upcoming")
                  }
                >
                  <Calendar className="h-4 w-4" />
                  Confirm Appointment
                </Button>
                {selectedCamp &&
                  selectedCamp.status !== "Open" &&
                  selectedCamp.status !== "Upcoming" && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      This center is currently{" "}
                      {selectedCamp.status.toLowerCase()} and not accepting
                      appointments.
                    </p>
                  )}
              </div>
            </Card>
          </div>

          {/* Add upcoming appointments section */}
          <Card className="shadow-md border-gray-200 mt-6">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <CalendarClock className="h-5 w-5 text-red-500" />
                Your Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {appointments && appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {appointment.campId
                              ? appointment.campId.name
                              : "Unknown Camp"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.time}
                          </p>
                        </div>
                      </div>
                      {/* Desktop Buttons */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-gray-300"
                          onClick={() => setRescheduleAppointment(appointment)}
                        >
                          Reschedule
                        </Button>
                        {rescheduleAppointment && (
                          <RescheduleModal
                            isOpen={!!rescheduleAppointment}
                            onClose={() => setRescheduleAppointment(null)}
                            appointment={rescheduleAppointment}
                            onReschedule={handleRescheduleAppointment}
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setAppointmentToCancel(appointment)}
                        >
                          Cancel
                        </Button>
                        <CancelConfirmationModal
                          isOpen={!!appointmentToCancel}
                          onClose={() => setAppointmentToCancel(null)}
                          onConfirm={async () => {
                            if (appointmentToCancel) {
                              setIsCancelling(true);
                              await handleCancelAppointment(
                                appointmentToCancel._id
                              );
                              setIsCancelling(false);
                              setAppointmentToCancel(null);
                            }
                          }}
                          loading={isCancelling}
                        />
                      </div>
                      {/* Mobile Actions (3-dot menu) */}
                      <div className="sm:hidden">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-36 p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-gray-300"
                              onClick={() =>
                                setRescheduleAppointment(appointment)
                              }
                            >
                              Reschedule
                            </Button>
                            {rescheduleAppointment && (
                              <RescheduleModal
                                isOpen={!!rescheduleAppointment}
                                onClose={() => setRescheduleAppointment(null)}
                                appointment={rescheduleAppointment}
                                onReschedule={handleRescheduleAppointment}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-red-600"
                              onClick={() =>
                                setAppointmentToCancel(appointment)
                              }
                            >
                              Cancel
                            </Button>
                            <CancelConfirmationModal
                              isOpen={!!appointmentToCancel}
                              onClose={() => setAppointmentToCancel(null)}
                              onConfirm={async () => {
                                if (appointmentToCancel) {
                                  setIsCancelling(true);
                                  await handleCancelAppointment(
                                    appointmentToCancel._id
                                  );
                                  setIsCancelling(false);
                                  setAppointmentToCancel(null);
                                }
                              }}
                              loading={isCancelling}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Schedule your next donation to help save lives
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer isDarkMode={false} />
      </div>
    </RouteGuard>
  );
};

export default BloodDonationAppointments;
