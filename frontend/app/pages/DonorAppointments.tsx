import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, Clock, Hospital } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MapComponent from "../components/Map";
import useUser from "../hooks/useUser";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

// Types for our component
interface DonationCamp {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableSlots: number;
  operatingHours: string;
  availableDates: string[]; // New field for available dates
}

interface Appointment {
  campId: string;
  date: string;
  time: string;
}

interface Camp {
  _id: string;
  name: string;
  distance: number;
  distanceUnit: string;
  status: string;
  availableDates: string;
}

const BloodDonationAppointments: React.FC = () => {
  const { user } = useUser();
  const [nearestCamps, setNearestCamps] = useState<DonationCamp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<DonationCamp | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (user && user.location) {
        const { location } = user;
        // If the user has a stored location, use it
        const [longitude, latitude] = location?.coordinates || [];
        console.log("Using stored location:", { latitude, longitude });
        const radius = 20; // Example: 10 km radius
        setLatitude(latitude);
        setLongitude(longitude);
        fetchNearbyCamps(latitude, longitude, radius);
      } else if (navigator.geolocation) {
        // If no stored location, use browser geolocation (for mobile)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Using browser location:", { latitude, longitude });
            const radius = 50; // Example: 10 km radius
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

    // Fetch nearby camps with lat, lng, and radius
    const fetchNearbyCamps = async (
      lat: number,
      lng: number,
      radius: number
    ) => {
      try {
        console.log("Fetching nearby camps with the following parameters:", {
          lat,
          lng,
          radius,
        });

        const response = await fetch(
          `http://localhost:3001/camps/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby camps");
        }

        const data = await response.json();
        console.log("Nearby Camps Data:", data); // Log the fetched camps data

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
  }, [user]); // Re-run effect if user changes

  useEffect(() => {
    // Simulated function to fetch nearest donation camps with available dates
    const fetchNearestCamps = async () => {
      const mockCamps: DonationCamp[] = [
        {
          id: "1",
          name: "City Central Hospital",
          address: "123 Main St, Cityville",
          distance: 2.5,
          availableSlots: 10,
          operatingHours: "8 AM - 4 PM",
          availableDates: ["2024-03-01", "2024-03-02", "2024-03-03"],
        },
        {
          id: "2",
          name: "Red Cross Center",
          address: "456 Health Ave, Townsburg",
          distance: 5.2,
          availableSlots: 15,
          operatingHours: "9 AM - 5 PM",
          availableDates: ["2024-03-02", "2024-03-03", "2024-03-04"],
        },
      ];
      setNearestCamps(mockCamps);
    };

    fetchNearestCamps();
  }, []);

  // Reset appointment date when camp changes
  useEffect(() => {
    setAppointmentDate("");
    setAppointmentTime("");
  }, [selectedCamp]);

  const handleAppointmentBooking = () => {
    if (selectedCamp && appointmentDate && appointmentTime) {
      const newAppointment: Appointment = {
        campId: selectedCamp.id,
        date: appointmentDate,
        time: appointmentTime,
      };
      console.log("Booking Appointment:", newAppointment);
      alert("Appointment Booked Successfully!");
    } else {
      alert("Please select a camp, date, and time");
    }
  };

  // Generate date options based on selected camp
  const availableDateOptions = useMemo(() => {
    return (
      selectedCamp?.availableDates.map((date) => ({
        value: date,
        label: new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })) || []
    );
  }, [selectedCamp]);
  console.log("location", user?.location);
  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <Loader />
        <p style={{ marginTop: "10px" }}>Loading...</p>
      </div>
    );
  }
  const fallbackLatitude = latitude ?? 6.9271; // Default: Colombo
  const fallbackLongitude = longitude ?? 79.8612; // Default: Colombo

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
          <CardContent>
            {nearestCamps.map((camp) => (
              <div
                key={camp.id}
                className={`border p-4 mb-4 rounded cursor-pointer ${
                  selectedCamp?.id === camp.id ? "bg-blue-100" : ""
                }`}
                onClick={() => setSelectedCamp(camp)}
              >
                <div className="flex items-center mb-2">
                  <Hospital className="mr-2 text-red-500" />
                  <h3 className="font-semibold">{camp.name}</h3>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 text-gray-500" size={16} />
                  <p>{camp.address}</p>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 text-gray-500" size={16} />
                    <span>{camp.operatingHours}</span>
                  </div>
                  <span className="text-green-600">
                    {camp.availableSlots} slots available
                  </span>
                </div>
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
                    {availableDateOptions.map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Select Time:</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!appointmentDate}
                  />
                </div>
                <Button
                  onClick={handleAppointmentBooking}
                  className="w-full"
                  disabled={
                    !selectedCamp || !appointmentDate || !appointmentTime
                  }
                >
                  Book Appointment
                </Button>
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
        {camps.map((camp) => {
          return (
            <div key={camp._id}>
              {camp.name} - {camp.distance} {camp.distanceUnit} away <br />
              status : {camp.status} , Date {camp.availableDates}
            </div>
          );
        })}

        <MapComponent
          userLatitude={fallbackLatitude}
          userLongitude={fallbackLongitude}
          apiKey={apiKey}
          showNearbyCamps={true}
        />
      </div>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default BloodDonationAppointments;
