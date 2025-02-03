import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar, Clock, Hospital } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const BloodDonationAppointments: React.FC = () => {
  const [nearestCamps, setNearestCamps] = useState<DonationCamp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<DonationCamp | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [appointmentTime, setAppointmentTime] = useState<string>("");

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

  return (
    <div className="container mx-auto p-4">
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
    </div>
  );
};

export default BloodDonationAppointments;
