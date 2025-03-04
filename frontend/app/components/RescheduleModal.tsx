import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import TimeSelector from "./TimeSelector";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onReschedule: (
    appointmentId: string,
    newDate: string,
    newTime: string
  ) => void;
}

interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface Location {
  type: string;
  coordinates: number[];
}

interface Camp {
  _id: string;
  name: string;
  operatingHours: string;
  address: Address;
  location: Location;
  availableDates: Date[];
}

interface Appointment {
  _id: string;
  campId: Camp;
  date: string;
  time: string;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onReschedule,
}) => {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleReschedule = () => {
    if (newDate && newTime) {
      onReschedule(appointment._id, newDate, newTime);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your donation at{" "}
            {appointment.campId.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select New Date:
            </label>
            <select
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Choose a new date</option>
              {appointment.campId.availableDates.map((date) => (
                <option
                  key={new Date(date).toISOString().split("T")[0]}
                  value={new Date(date).toISOString().split("T")[0]}
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          <TimeSelector
            operatingHours={appointment.campId.operatingHours}
            appointmentTime={newTime}
            setAppointmentTime={setNewTime}
            appointmentDate={newDate}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!newDate || !newTime}
            className="bg-red-600 hover:bg-red-700"
          >
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
