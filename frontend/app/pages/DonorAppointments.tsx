import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, Clock, Hospital, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "../components/Map";
import useUser from "../hooks/useUser";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useRouter } from "next/navigation";
import TimeSelector from "../components/TimeSelector";

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface Contact {
  phone: string;
  email: string;
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
  campId: string;
  date: string;
  time: string;
}

const BloodDonationAppointments: React.FC = () => {
  const { user, isInitialized } = useUser();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedCampId, setSelectedCampId] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      console.log("User data after initialization:", user);

      // Redirect if the user is not logged in
      if (!user?._id) {
        console.log("User is not logged in, redirecting to login page...");
        router.push("/login"); // Redirect to login page
      }
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    const getLocation = () => {
      if (user && user.location) {
        const { location } = user;
        const [longitude, latitude] = location?.coordinates || [];
        console.log("Using stored location:", { latitude, longitude });
        const radius = 20;
        setLatitude(latitude);
        setLongitude(longitude);
        fetchNearbyCamps(latitude, longitude, radius);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Using browser location:", { latitude, longitude });
            const radius = 50;
            fetchNearbyCamps(latitude, longitude, radius);
          },
          (error) => {
            setError("Unable to retrieve your location");
            setLoading(false);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser");
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
          `http://localhost:3001/camps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby camps");
        }

        const data = await response.json();
        setCamps(data);
        setLoading(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch nearby camps"
        );
        setLoading(false);
      }
    };

    getLocation();
  }, [user]);

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

  const handleAppointmentBooking = () => {
    if (selectedCamp && appointmentDate && appointmentTime) {
      const newAppointment: Appointment = {
        campId: selectedCamp._id,
        date: appointmentDate,
        time: appointmentTime,
      };
      console.log("Booking Appointment:", newAppointment);
      alert("Appointment Booked Successfully!");
    } else {
      alert("Please select a camp, date, and time");
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
    <div className="min-h-screen p-6 w-full mx-auto space-y-6 flex flex-col">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Blood Donation Appointments</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Nearest Camps Section */}
        <Card>
          <CardHeader>
            <CardTitle>Nearest Donation Camps</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {" "}
            {/* Add max height and overflow */}
            {camps.map((camp) => (
              <div
                key={camp._id}
                className={`border p-4 mb-4 rounded cursor-pointer ${
                  selectedCampId === camp._id ? "bg-blue-100" : ""
                }`}
                onClick={() => handleCampClick(camp)}
              >
                <div className="flex items-center mb-2 justify-between">
                  <div className="flex items-center">
                    <Hospital className="mr-2 text-red-500" />
                    <h3 className="font-semibold">{camp.name}</h3>
                  </div>
                  <span className={getStatusColor(camp.status)}>
                    {camp.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">{camp.description}</p>

                <div className="flex items-center mb-2">
                  <MapPin className="mr-2 text-gray-500" size={16} />
                  <p>
                    {camp.address.street}, {camp.address.city}{" "}
                    {camp.address.postalCode}
                  </p>
                </div>

                <div className="flex items-center mb-2">
                  <Clock className="mr-2 text-gray-500" size={16} />
                  <span>{camp.operatingHours}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="mr-1" size={14} />
                    <span>{camp.contact.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-1" size={14} />
                    <span>{camp.contact.email}</span>
                  </div>
                </div>

                {camp.distance && (
                  <div className="mt-2 text-sm text-gray-600">
                    Distance: {camp.distance} {camp.distanceUnit}
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-600">
                  Available Dates:{" "}
                  {camp.availableDates
                    .map((date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    )
                    .join(", ")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appointment Booking Section */}
        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCamp ? (
              <div>
                <div className="mb-4">
                  <label className="block mb-2">Selected Camp:</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedCamp.name}
                    className="w-full p-2 bg-gray-100 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Select Date:</label>
                  <select
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a Date</option>
                    {availableDates.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div className="mb-4">
                  <label className="block mb-2 mt-4">Select Time:</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!selectedCamp || !appointmentDate}
                  />
                </div> */}
                <TimeSelector
                  operatingHours={
                    selectedCamp?.operatingHours || "9:00 AM - 5:00 PM"
                  }
                  appointmentTime={appointmentTime}
                  setAppointmentTime={setAppointmentTime}
                  appointmentDate={appointmentDate}
                />

                <Button
                  onClick={handleAppointmentBooking}
                  className="w-full mt-4"
                  disabled={
                    !selectedCamp ||
                    !appointmentDate ||
                    !appointmentTime ||
                    (selectedCamp.status !== "Open" &&
                      selectedCamp.status !== "Upcoming")
                  }
                >
                  Book Appointment
                </Button>
                {selectedCamp &&
                  selectedCamp.status !== "Open" &&
                  selectedCamp.status !== "Upcoming" && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      This camp is currently {selectedCamp.status.toLowerCase()}
                      .
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Please select a donation camp first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="my-10">
        <MapComponent
          userLatitude={fallbackLatitude}
          userLongitude={fallbackLongitude}
          apiKey={apiKey}
          showNearbyCamps={true}
          selectedCampId={selectedCampId}
          onCampSelect={handleCampSelect}
        />
      </div>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default BloodDonationAppointments;
