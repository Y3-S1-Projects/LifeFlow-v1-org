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
import useUser from "../../hooks/useUser";
import Header from "../../components/Header";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import MapComponent from "../../components/Map";
import { getToken } from "../../utils/auth";
import { RouteGuard } from "@/app/components/RouteGuard";
import { toast, Toaster } from "sonner";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  dob?: string;
  donatedBefore?: string;
  terms?: string;
  weight?: string;
  street?: string;
  city?: string;
  state?: string;
  nicNo?: string;
  location?: string;
}
interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;
  dob: string;
  nicNo: string;
  donatedBefore: string;
  lastDonationDate: string;
  healthConditions: string[];
  additionalInfo: string;
  weight: number | null;
  address: {
    street: string;
    city: string;
    state: string;
  };
  location: Location;
}

export default function EligibilityForm() {
  const router = useRouter();
  const token = getToken();
  const { user, loading, error } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const [age, setAge] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    bloodType: "",
    dob: "",
    nicNo: "",
    donatedBefore: "no",
    lastDonationDate: "",
    healthConditions: [],
    additionalInfo: "",
    weight: null,
    address: {
      street: "",
      city: "",
      state: "",
    },
    location: {
      latitude: null,
      longitude: null,
    },
  });
  const [userLocation, setUserLocation] = useState({
    latitude: 6.9271, // Colombo's latitude
    longitude: 79.8612, // Colombo's longitude
  });

  // useEffect(() => {
  //   if (user && user.isProfileComplete) {
  //     router.push(
  //       "/donor/dashboard?message=" +
  //         encodeURIComponent("You have already completed the profile")
  //     );
  //   }
  // }, [user, router]);

  useEffect(() => {
    if (user) {
      setFormData((prevData) => {
        const newData = {
          ...prevData,
          fullName: user.fullName || prevData.fullName,
          email: user.email || prevData.email,
          phone: user.phoneNumber || prevData.phone,
          dob: user.dateOfBirth
            ? new Date(user.dateOfBirth).toISOString().split("T")[0]
            : prevData.dob,
          nicNo: user.nicNo || prevData.nicNo,
          bloodType: user.bloodType || prevData.bloodType || "none",
          weight: user.weight || prevData.weight,
          donatedBefore: user.donatedBefore || prevData.donatedBefore,
          lastDonationDate: user.lastDonationDate
            ? new Date(user.lastDonationDate).toISOString().split("T")[0]
            : prevData.lastDonationDate,
          healthConditions: user.healthConditions || prevData.healthConditions,
          additionalInfo: user.additionalInfo || prevData.additionalInfo,
          address: {
            street: user.address?.street || prevData.address.street,
            city: user.address?.city || prevData.address.city,
            state: user.address?.state || prevData.address.state,
          },
        };
        return newData;
      });
    }
  }, [user]);

  useEffect(() => {
    if (formData.dob) {
      // Calculate and set age
      const calculatedAge = calculateAge(formData.dob);
      setAge(calculatedAge);

      // Validate DOB and update errors state
      const dobError = validateDOB(formData.dob);
      setErrors((prev) => ({
        ...prev,
        dob: dobError,
      }));

      // If NIC validation depends on DOB, revalidate NIC when DOB changes
      if (formData.nicNo) {
        const nicError = validateNIC(formData.nicNo, formData.dob);
        setErrors((prev) => ({
          ...prev,
          nicNo: nicError,
        }));
      }
    } else {
      setAge(null);
    }
  }, [formData.dob, formData.nicNo]);

  const validateNIC = (nic: string, dob: string): string | undefined => {
    if (!nic) return "NIC is required";

    const nicLength = nic.length;
    const dobDate = new Date(dob);
    const birthYear = dobDate.getFullYear();

    // Validate NIC length
    if (nicLength !== 10 && nicLength !== 12) {
      return "NIC must be either 10 or 12 digits long";
    }

    // Validate old NIC format
    if (nicLength === 10) {
      const nicYear = parseInt(nic.substring(0, 2), 10);
      const expectedYear = birthYear % 100; // Last two digits of the birth year

      if (nicYear !== expectedYear) {
        return "NIC does not match the birth year (old format)";
      }

      // Check if the last character is a digit or 'V'
      const lastChar = nic.charAt(8);
      if (!/\d|V/i.test(lastChar)) {
        return "Invalid NIC format (old format)";
      }
    }

    // Validate new NIC format
    if (nicLength === 12) {
      const nicYear = parseInt(nic.substring(0, 4), 10);

      if (nicYear !== birthYear) {
        return "NIC does not match the birth year (new format)";
      }

      // Check if the last character is a digit
      const lastChar = nic.charAt(11);
      if (!/\d/.test(lastChar)) {
        return "Invalid NIC format (new format)";
      }
    }

    return undefined; // No error - using undefined instead of null
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const errorMessages: string[] = [];

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
      errorMessages.push("Full name is required");
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      errorMessages.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
      errorMessages.push("Email address is invalid");
    }

    if (!formData.nicNo) {
      newErrors.nicNo = "NIC is required";
      errorMessages.push("NIC is required");
    } else {
      const nicError = validateNIC(formData.nicNo, formData.dob);
      if (nicError) {
        newErrors.nicNo = nicError;
        errorMessages.push(nicError);
      }
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      errorMessages.push("Phone number is required");
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
      errorMessages.push("Phone number is invalid");
    }

    if (!formData.location.latitude || !formData.location.longitude) {
      newErrors.location = "You must select your location on the map";
      errorMessages.push("Location selection is required");
    } else if (
      Math.abs(formData.location.latitude - 6.9271) < 0.0001 &&
      Math.abs(formData.location.longitude - 79.8612) < 0.0001
    ) {
      newErrors.location = "Please select your actual location on the map";
      errorMessages.push("Please select your actual location on the map");
    }

    if (!formData.bloodType) {
      newErrors.bloodType = "Blood type is required";
      errorMessages.push("Blood type is required");
    }

    if (formData.weight === null || formData.weight === undefined) {
      newErrors.weight = "Weight is required";
      errorMessages.push("Weight is required");
    }

    if (!formData.address.street) {
      newErrors.street = "Street is required";
      errorMessages.push("Street address is required");
    }

    if (!formData.address.city) {
      newErrors.city = "City is required";
      errorMessages.push("City is required");
    }

    if (!formData.address.state) {
      newErrors.state = "State is required";
      errorMessages.push("State is required");
    }

    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
      errorMessages.push("Date of Birth is required");
    } else {
      const dobError = validateDOB(formData.dob);
      if (dobError) {
        newErrors.dob = dobError;
        errorMessages.push(dobError);
      }
    }
    if (!formData.bloodType) {
      newErrors.bloodType = "Blood type is required";
      errorMessages.push("Blood type is required");
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
      errorMessages.push("Terms and conditions must be accepted");
    }

    setErrors(newErrors);

    // Display a single toast for multiple errors or individual message if only one error
    if (errorMessages.length > 0) {
      if (errorMessages.length === 1) {
        toast.error(errorMessages[0]);
      } else {
        toast.error(
          `Please fill or check the following ${errorMessages.length} fields to continue`
        );
      }
    }

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form (including location)
    if (!validateForm()) {
      return; // Stop submission if there are errors
    }

    // Proceed with form submission
    const dataToSubmit = {
      ...formData,
      dateOfBirth: formData.dob.replace(/-/g, "/"), // Convert YYYY-MM-DD to YYYY/MM/DD
      isProfileComplete: true,
      lat: formData.location.latitude,
      lng: formData.location.longitude,
      location: undefined,
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
            Authorization: `Bearer ${token}`,
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
      router.push(
        "/donor/dashboard?message=" +
          encodeURIComponent("You have updated your Profile")
      );
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
  // Get user's current location on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleLocationSelect = (lat: number, lng: number): void => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: lat,
        longitude: lng,
      },
    }));
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

  const validateDOB = (dob: string): string | undefined => {
    // If empty, return early
    if (!dob) return "Date of birth is required";

    const today = new Date();
    const birthDate = new Date(dob);

    // Check if valid date
    if (isNaN(birthDate.getTime())) {
      return "Invalid date format";
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

    // Ensure user is within eligible age range (17-65)
    const age = calculateAge(dob);
    if (age === null) return "Invalid date of birth";

    if (age < 17) {
      return "You must be at least 17 years old to be eligible";
    }

    if (age > 65) {
      return "Maximum eligible age is 65 years";
    }

    return undefined; // No errors - using undefined instead of null
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
        <div className="space-y-6 w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                padding: "16px",
              },
            }}
          />
          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg"
          >
            <h2 className="text-2xl font-bold text-center">
              Complete Your Profile
            </h2>

            {/* Personal Information */}
            <div className="space-y-4">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="email">
                Email<span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                pattern="^\d{10}$"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="dob">
                Date of Birth<span className="text-red-500">*</span>
              </Label>
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
              {errors.dob && (
                <p className="text-red-500 text-sm">{errors.dob}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="nicNo">
                NIC<span className="text-red-500">*</span>
              </Label>
              <Input
                id="nicNo"
                name="nicNo"
                type="text"
                value={formData.nicNo}
                onChange={handleInputChange}
              />
              {errors.nicNo && (
                <p className="text-red-500 text-sm">{errors.nicNo}</p>
              )}
            </div>
            {/* Map Section */}
            <div className="space-y-4">
              <Label>
                Select Your Location <span className="text-red-500">*</span>
              </Label>
              <div className="my-10">
                <MapComponent
                  apiKey={apiKey}
                  userLatitude={userLocation.latitude}
                  userLongitude={userLocation.longitude}
                  onLocationSelect={handleLocationSelect}
                />
                {errors.location && (
                  <p className="text-red-500 mt-2">{errors.location}</p>
                )}
              </div>
              {formData.location.latitude && formData.location.longitude && (
                <p className="text-sm text-gray-600">
                  Selected location: {formData.location.latitude.toFixed(6)},{" "}
                  {formData.location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className=" font-semibold">Address</h3>
              <Label htmlFor="street">
                Street<span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                name="street"
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
              {errors.street && (
                <p className="text-red-500 text-sm">{errors.street}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="city">
                City<span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="state">
                State<span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
              />
              {errors.state && (
                <p className="text-red-500 text-sm">{errors.state}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="weight">
                Weight (in kg)<span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight ?? ""}
                onChange={handleInputChange}
                min="0"
                step="0.1" // Allows decimal input for fractional kg (optional)
              />
              {formData.weight && formData.weight < 50 && (
                <p className="text-red-500 text-sm">
                  Weight must be at least 50 kg to donate blood.
                </p>
              )}
              {errors.weight && (
                <p className="text-red-500 text-sm">{errors.weight}</p>
              )}
            </div>

            {/* Blood Donation Details */}
            <div className="space-y-4">
              <Label htmlFor="bloodType">
                Blood Type<span className="text-red-500">*</span>
              </Label>
              <Select
                value={user?.bloodType || formData.bloodType || "none"} // Use "none" as the default when nothing is selected
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not sure">I'm not sure</SelectItem>{" "}
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
                  I confirm that the information provided above is accurate and
                  up-to-date.<span className="text-red-500">*</span>
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
      </div>
    </RouteGuard>
  );
}
