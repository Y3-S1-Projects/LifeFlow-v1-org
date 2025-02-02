import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import useUser from "../hooks/useUser";
import Header from "../components/Header";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  dob?: string;
  donatedBefore?: string;
  terms?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  dob: string;
  donatedBefore: string;
  lastDonationDate: Date | null;
  healthConditions: string[];
  additionalInfo: string;
}

export default function EligibilityForm() {
  const router = useRouter();
  const { user, loading, error } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "",
    dob: "",
    donatedBefore: "no",
    lastDonationDate: null,
    healthConditions: [],
    additionalInfo: "",
  });

  console.log("User blood type:", user?.bloodType);
  console.log("Form data blood type:", formData.bloodType);

  useEffect(() => {
    if (user && user.isProfileComplete) {
      router.push(
        "/donor-dashboard?message=" +
          encodeURIComponent("You have already completed the profile")
      );
    }
  }, [user, router]);
  useEffect(() => {
    if (user) {
      console.log("Before update - bloodType:", formData.bloodType);
      console.log("User bloodType:", user.bloodType);
      setFormData((prevData) => {
        const newData = {
          ...prevData,
          fullName: user.fullName || prevData.fullName,
          email: user.email || prevData.email,
          phone: user.phoneNumber || prevData.phone,
          dob: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : prevData.dob,
          bloodType: user.bloodType || prevData.bloodType,
          donatedBefore: user.donatedBefore || prevData.donatedBefore,
          lastDonationDate: user.lastDonationDate || prevData.lastDonationDate,
          healthConditions: user.healthConditions || prevData.healthConditions,
          additionalInfo: user.additionalInfo || prevData.additionalInfo,
        };
        console.log("After update - new formData:", newData);
        return newData;
      });
    }
  }, [user]);

  useEffect(() => {
    if (formData.dob) {
      const calculatedAge = calculateAge(formData.dob);
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [formData.dob]);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }
    if (!formData.bloodType) {
      newErrors.bloodType = "Blood type is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const dobError = validateDOB(formData.dob);
      if (dobError) {
        newErrors.dob = dobError;
      }
    }
    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      dateOfBirth: formData.dob.replace(/-/g, "/"), // Convert YYYY-MM-DD to YYYY/MM/DD
      isProfileComplete: true,
    };

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(
        `http://localhost:3001/users/updateUser/${user?._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const data = await response.json();
      setSubmitSuccess(true);
      // Optionally reset form or redirect user
      // setFormData(initialFormState);
      // or
      // router.push('/profile');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the form"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate age based on DOB
  const calculateAge = (dob: string): number | null => {
    const birthDate = new Date(dob);
    const today = new Date();
    if (isNaN(birthDate.getTime())) return null; // Invalid date

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Validate age range (17-65 years)
  const validateAgeRange = (dob: string): string | null => {
    const age = calculateAge(dob);
    if (age === null) return "Invalid date of birth";

    if (age < 17 || age > 65) {
      return "You must be between 17 and 65 years old to be eligible";
    }

    return null;
  };

  const validateDOB = (dob: string): string | null => {
    const today = new Date();
    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
      return "Invalid date";
    }

    // Prevent future dates
    if (birthDate > today) {
      return "Date of birth cannot be in the future";
    }

    // Prevent dates more than 120 years ago
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    if (birthDate < minDate) {
      return "Date of birth is too far in the past";
    }

    // Ensure user is between 17 and 65 years old
    const ageError = validateAgeRange(dob);
    if (ageError) {
      return ageError;
    }

    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bloodType: value }));
  };

  const handleRadioChange = (value: "yes" | "no") => {
    setFormData((prev) => ({ ...prev, donatedBefore: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(value)
        ? prev.healthConditions.filter((condition) => condition !== value)
        : [...prev.healthConditions, value],
    }));
  };

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
  };
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6 w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Header />
      <form
        onSubmit={handleSubmit}
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
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter Your Full Name"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            readOnly
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]} // Prevent future dates
          />
          {age !== null && (
            <p className="text-sm text-gray-600">Age: {age} years</p>
          )}
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>
        {/* Blood Donation Details */}
        <div className="space-y-4">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            defaultValue={user?.bloodType}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your blood type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
            </SelectContent>
          </Select>
          {errors.bloodType && (
            <p className="text-red-500 text-sm">{errors.bloodType}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Have you donated blood before?</Label>
          <RadioGroup
            value={formData.donatedBefore}
            onValueChange={handleRadioChange}
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
        </div>

        {/* Health Information */}
        <div className="space-y-4">
          <Label>Health Conditions</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition1"
                checked={formData.healthConditions.includes("highBP")}
                onCheckedChange={() => handleCheckboxChange("highBP")}
              />
              <Label htmlFor="condition1">High Blood Pressure</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition2"
                checked={formData.healthConditions.includes("diabetes")}
                onCheckedChange={() => handleCheckboxChange("diabetes")}
              />
              <Label htmlFor="condition2">Diabetes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="condition3"
                checked={formData.healthConditions.includes("heartDisease")}
                onCheckedChange={() => handleCheckboxChange("heartDisease")}
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
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Any additional information you'd like to share (e.g., allergies, medications, etc.)"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={handleTermsChange}
            />
            <Label htmlFor="terms">
              I agree to the terms and conditions of blood donation.
            </Label>
          </div>
          {errors.terms && (
            <p className="text-red-500 text-sm">{errors.terms}</p>
          )}
        </div>

        {/* Error and Success Messages */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{submitError}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">Profile updated successfully!</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Updating..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
