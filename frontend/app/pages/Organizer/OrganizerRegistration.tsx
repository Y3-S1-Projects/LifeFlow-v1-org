import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Building,
  User,
  FileText,
  MapPin,
} from "lucide-react";
import GlobalHeader from "../../components/GlobalHeader";
import Footer from "../../components/Footer";

interface ProgressStepProps {
  step: number;
  currentStep: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  step,
  currentStep,
  title,
  icon: Icon,
}) => (
  <div
    className={`flex items-center ${
      currentStep === step
        ? "text-blue-600"
        : currentStep > step
        ? "text-green-600"
        : "text-gray-400"
    }`}
  >
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
      ${
        currentStep === step
          ? "border-blue-600 bg-blue-50"
          : currentStep > step
          ? "border-green-600 bg-green-50"
          : "border-gray-300"
      }`}
    >
      {currentStep > step ? (
        <Check className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </div>
    <span className="ml-2 text-sm font-medium">{title}</span>
    {step < 4 && <ChevronRight className="w-4 h-4 mx-2" />}
  </div>
);

interface FormData {
  orgName: string;
  orgType: string;
  regNumber: string;
  yearEstablished: string;
  website: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  licenseNumber: string;
  validityPeriod: string;
  previousCamps: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  facilities: string;
  equipmentList: string;
}

const OrganizerRegistration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    orgName: "",
    orgType: "",
    regNumber: "",
    yearEstablished: "",
    website: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    licenseNumber: "",
    validityPeriod: "",
    previousCamps: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    facilities: "",
    equipmentList: "",
  });
  const [isDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-screen mx-auto p-6">
      <div className="max-w-4xl mx-auto p-6">
        <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Blood Camp Organizer Registration
            </CardTitle>
            <div className="flex justify-between items-center mt-6">
              <ProgressStep
                step={1}
                currentStep={currentStep}
                title="Organization"
                icon={Building}
              />
              <ProgressStep
                step={2}
                currentStep={currentStep}
                title="Contact Person"
                icon={User}
              />
              <ProgressStep
                step={3}
                currentStep={currentStep}
                title="Documents"
                icon={FileText}
              />
              <ProgressStep
                step={4}
                currentStep={currentStep}
                title="Location"
                icon={MapPin}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Organization Name*</Label>
                    <Input
                      id="orgName"
                      name="orgName"
                      value={formData.orgName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgType">Organization Type*</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange(value, "orgType")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">Hospital</SelectItem>
                        <SelectItem value="ngo">NGO</SelectItem>
                        <SelectItem value="bloodBank">Blood Bank</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="regNumber">Registration Number*</Label>
                    <Input
                      id="regNumber"
                      name="regNumber"
                      value={formData.regNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearEstablished">Year Established*</Label>
                    <Input
                      id="yearEstablished"
                      name="yearEstablished"
                      type="number"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name*</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name*</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address*</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position in Organization*</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="licenseNumber">
                      Medical License Number*
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityPeriod">
                      License Validity Period*
                    </Label>
                    <Input
                      id="validityPeriod"
                      name="validityPeriod"
                      type="date"
                      value={formData.validityPeriod}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Upload Documents*</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 mt-1">
                      <div className="text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Upload the following documents:
                          </p>
                          <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                            <li>Medical practice license</li>
                            <li>Organization registration certificate</li>
                            <li>Blood bank operation permit</li>
                            <li>Safety compliance certificate</li>
                          </ul>
                        </div>
                        <Button className="mt-2" variant="outline">
                          Upload Files
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="previousCamps">
                      Previous Blood Camps Organized
                    </Label>
                    <Textarea
                      id="previousCamps"
                      name="previousCamps"
                      value={formData.previousCamps}
                      onChange={handleInputChange}
                      placeholder="Please list dates and locations of previous blood donation camps..."
                      className="h-24"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address*</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City*</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State*</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode*</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="facilities">Available Facilities*</Label>
                    <Textarea
                      id="facilities"
                      name="facilities"
                      value={formData.facilities}
                      onChange={handleInputChange}
                      placeholder="Describe available facilities (e.g., air conditioning, waiting area, emergency equipment)..."
                      className="h-24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipmentList">
                      Medical Equipment List*
                    </Label>
                    <Textarea
                      id="equipmentList"
                      name="equipmentList"
                      value={formData.equipmentList}
                      onChange={handleInputChange}
                      placeholder="List all available medical equipment for blood donation..."
                      className="h-24"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Previous
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto bg-green-600 hover:bg-green-700"
                  >
                    Submit Registration
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default OrganizerRegistration;
