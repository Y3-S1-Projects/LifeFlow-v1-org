import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, SubmitHandler } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea"; // Import the Textarea component

import useUser from "../hooks/useUser";
import Header from "./Header";

// Define the form data types
interface BloodDonationFormData {
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  dob: string;
  donatedBefore: "yes" | "no";
  donationDate: string;
  donationTime: string;
  healthConditions: string[];
  terms: boolean;
  additionalInfo: string; // New field for additional information
}

export default function EligibilityForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BloodDonationFormData>();

  const onSubmit: SubmitHandler<BloodDonationFormData> = (
    data: BloodDonationFormData
  ) => {
    console.log(data);
    // Handle form submission (e.g., send data to an API)
  };

  const { user, loading, error } = useUser();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6 w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Header />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg"
      >
        <h2 className="text-2xl font-bold text-center">
          Complete Your Profile
        </h2>

        {/* Personal Information */}
        <div className="space-y-4">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register("fullName", { required: "Full name is required" })}
            placeholder="Enter Your Full Name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email}
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={user?.phoneNumber}
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            {...register("dob", {
              required: "Date of Birth is required",
            })}
          />
          {errors.dob && (
            <p className="text-red-500 text-sm">{errors.dob.message}</p>
          )}
        </div>

        {/* Blood Donation Details */}
        <div className="space-y-4">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            {...register("bloodType", { required: "Blood type is required" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your blood type" />
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
            </SelectContent>
          </Select>
          {errors.bloodType && (
            <p className="text-red-500 text-sm">{errors.bloodType.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Have you donated blood before?</Label>
          <RadioGroup
            defaultValue="no"
            {...register("donatedBefore", {
              required: "This field is required",
            })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
          {errors.donatedBefore && (
            <p className="text-red-500 text-sm">
              {errors.donatedBefore.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Preferred Donation Date</Label>
          <Input
            type="date"
            {...register("donationDate", {
              required: "Donation date is required",
            })}
          />
          {errors.donationDate && (
            <p className="text-red-500 text-sm">
              {errors.donationDate.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Preferred Donation Time</Label>
          <Input
            type="time"
            {...register("donationTime", {
              required: "Donation time is required",
            })}
          />
          {errors.donationTime && (
            <p className="text-red-500 text-sm">
              {errors.donationTime.message}
            </p>
          )}
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <Label>Health Conditions</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition1"
                {...register("healthConditions")}
                value="highBP"
              />
              <Label htmlFor="condition1">High Blood Pressure</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition2"
                {...register("healthConditions")}
                value="diabetes"
              />
              <Label htmlFor="condition2">Diabetes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition3"
                {...register("healthConditions")}
                value="heartDisease"
              />
              <Label htmlFor="condition3">Heart Disease</Label>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <Label htmlFor="additionalInfo">Additional Information</Label>
          <Textarea
            id="additionalInfo"
            {...register("additionalInfo")}
            placeholder="Any additional information you'd like to share (e.g., allergies, medications, etc.)"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
            />
            <Label htmlFor="terms">
              I agree to the terms and conditions of blood donation.
            </Label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm">{errors.terms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
}
