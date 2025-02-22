import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

interface TimeObject {
  hours: number;
  minutes: number;
}

interface TimeSelectorProps {
  operatingHours: string;
  appointmentTime: string;
  setAppointmentTime: (time: string) => void;
  appointmentDate: string | "";
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  operatingHours,
  appointmentTime,
  setAppointmentTime,
  appointmentDate,
}) => {
  const [error, setError] = useState<string | null>(null);

  const parseOperatingHours = (
    hoursString: string
  ): { start: TimeObject; end: TimeObject } => {
    const [start, end] = hoursString.split(" - ").map((time) => {
      const [hours, minutes] = time
        .replace(/[AP]M/, "")
        .split(":")
        .map((num) => parseInt(num));
      const isPM = time.includes("PM");
      return {
        hours:
          isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours,
        minutes,
      };
    });

    return { start, end };
  };

  const { start, end } = parseOperatingHours(operatingHours);

  const formatTimeForInput = (hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const minTime = formatTimeForInput(start.hours, start.minutes);
  const maxTime = formatTimeForInput(end.hours, end.minutes);

  const formatTimeForDisplay = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedTime = e.target.value;
    setAppointmentTime(selectedTime); // Always update the time to allow editing

    const [hours, minutes] = selectedTime
      .split(":")
      .map((num) => parseInt(num));

    if (
      (hours > start.hours ||
        (hours === start.hours && minutes >= start.minutes)) &&
      (hours < end.hours || (hours === end.hours && minutes <= end.minutes))
    ) {
      setError(null); // Clear error if time is valid
    } else {
      setError(
        `Please select a time between ${formatTimeForDisplay(
          minTime
        )} and ${formatTimeForDisplay(maxTime)}`
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Select Time:</label>
        <input
          type="time"
          value={appointmentTime}
          onChange={handleTimeChange}
          min={minTime}
          max={maxTime}
          className={`w-full p-2 border rounded ${
            error ? "border-red-300" : "border-gray-200"
          }`}
          disabled={!appointmentDate}
        />
        <p className="text-sm text-gray-600 mt-1">
          Operating hours: {operatingHours}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TimeSelector;
