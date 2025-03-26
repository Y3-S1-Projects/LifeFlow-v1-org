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
  Upload,
  X,
} from "lucide-react";
import GlobalHeader from "../../components/GlobalHeader";
import Footer from "../../components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { getUserIdFromToken } from "@/app/utils/auth";

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
  password: string;
  documents: File[];
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
    password: "",
    documents: [],
  });
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://lifeflow-v1-org-production.up.railway.app"
      : "http://localhost:3001";
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: acceptedFiles => {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...acceptedFiles]
      }));
      setUploadError(null);
    },
    onDropRejected: rejectedFiles => {
      setUploadError(rejectedFiles[0]?.errors[0]?.message || 'File rejected');
    }
  });

  const removeFile = (index: number) => {
    setFormData(prev => {
      const newDocuments = [...prev.documents];
      newDocuments.splice(index, 1);
      return { ...prev, documents: newDocuments };
    });
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, setScrolled] = useState(false);
  const router = useRouter();

  // Calculate max and min dates for year established and license validity
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Calculate max date (5 years from now) for license validity
  const maxValidityDate = new Date();
  maxValidityDate.setFullYear(maxValidityDate.getFullYear() + 5);
  const maxValidityDateString = maxValidityDate.toISOString().split('T')[0];

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.orgName) newErrors.orgName = "Organization Name is required";
        if (!formData.orgType) newErrors.orgType = "Organization Type is required";
        if (!formData.regNumber) newErrors.regNumber = "Registration Number is required";
        if (!formData.yearEstablished) {
          newErrors.yearEstablished = "Year Established is required";
        } else {
          const year = parseInt(formData.yearEstablished);
          if (isNaN(year) || year > currentYear) {
            newErrors.yearEstablished = "Year must be valid and in the past";
          }
        }
        
        if (formData.website) {
          const websiteRegex = /^(https?:\/\/)?(www\.)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(.*)$/;
          if (!websiteRegex.test(formData.website)) {
            newErrors.website = "Website must be in format www.example.com";
          }
        }
        break;
        
      case 2:
        if (!formData.firstName) newErrors.firstName = "First Name is required";
        if (!formData.lastName) newErrors.lastName = "Last Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone Number is required";
        
        if (!formData.position) {
          newErrors.position = "Position is required";
        } else if (/\d/.test(formData.position)) {
          newErrors.position = "Position cannot contain numbers";
        }
        
        if (!formData.password) newErrors.password = "Password is required";
        break;
        
      case 3:
        if (!formData.licenseNumber) newErrors.licenseNumber = "License Number is required";
        
        if (!formData.validityPeriod) {
          newErrors.validityPeriod = "Validity Period is required";
        } else {
          const selectedDate = new Date(formData.validityPeriod);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate <= today) {
            newErrors.validityPeriod = "Date must be in the future";
          } else if (selectedDate > maxValidityDate) {
            newErrors.validityPeriod = "Date cannot be more than 5 years in the future";
          }
        }

        if (formData.documents.length === 0) {
          newErrors.documents = "At least one document is required";
        }
        break;
        
      case 4:
        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.pincode) newErrors.pincode = "Pincode is required";
        if (!formData.facilities) newErrors.facilities = "Facilities are required";
        if (!formData.equipmentList) newErrors.equipmentList = "Equipment List is required";
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Special validation for position field
    if (name === "position" && /\d/.test(value)) {
      setErrors(prev => ({
        ...prev,
        position: "Position cannot contain numbers"
      }));
      return;
    }
    
    // Special validation for website
    if (name === "website") {
      const websiteRegex = /^(https?:\/\/)?(www\.)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(.*)$/;
      if (value && !websiteRegex.test(value)) {
        setErrors(prev => ({
          ...prev,
          website: "Website must be in format www.example.com"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.website;
          return newErrors;
        });
      }
    }
    
    setFormData(prev => ({
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
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  async function fetchOrganizerId  () {
    try{
      const organizerId = await getUserIdFromToken();
      return organizerId;
    } catch (error) {
      console.error("Error fetching organizer ID:", error);
      throw error;

    }
  }

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
  
      // Prepare registration data without documents
      const registrationData = { 
        ...formData,
        documents: undefined // Remove the documents array
      };
  
      // 1. First try to register the organizer
      const registrationResponse = await axios.post(
        `${API_BASE_URL}/organizers/register`,
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          withCredentials: true
        }
      );
  
      // 2. If registration succeeds, upload documents if any
      if (formData.documents.length > 0 && registrationResponse.data.organizer?.id) {
        const formDataWithFiles = new FormData();
        formData.documents.forEach(file => {
          formDataWithFiles.append('documents', file);
        });
        formDataWithFiles.append('documentType', 'registration');
        formDataWithFiles.append('organizerId', registrationResponse.data.organizer.id);
  
        await axios.post(
          `${API_BASE_URL}/organizers/documents`,
          formDataWithFiles,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'X-CSRF-Token': csrfToken,
            },
            withCredentials: true,
            onUploadProgress: progressEvent => {
              if (progressEvent.total) {
                setUploadProgress(
                  Math.round((progressEvent.loaded * 100) / progressEvent.total)
                );
              }
            }
          }
        );
      }
  
      toast.success("Registration Successful", {
        description: "Your registration has been submitted successfully.",
      });
      router.push("/organizer/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An error occurred during registration.";
      
      if (error.response) {
        // Backend returned an error response
        errorMessage = error.response.data.message || 
                      error.response.data.error?.message || 
                      errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please try again.";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || errorMessage;
      }
  
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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
                    {errors.orgName && <p className="text-red-500 text-sm">{errors.orgName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="orgType">Organization Type*</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange(value, "orgType")
                      }
                      value={formData.orgType}
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
                    {errors.orgType && <p className="text-red-500 text-sm">{errors.orgType}</p>}
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
                    {errors.regNumber && <p className="text-red-500 text-sm">{errors.regNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="yearEstablished">Year Established* (must be a past year)</Label>
                    <Input
                      id="yearEstablished"
                      name="yearEstablished"
                      type="number"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      max={currentYear}
                      required
                    />
                    {errors.yearEstablished && <p className="text-red-500 text-sm">{errors.yearEstablished}</p>}
                  </div>
                  <div>
                    <Label htmlFor="website">Website (format: www.example.com)</Label>
                    <Input
                      id="website"
                      name="website"
                      type="text"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="www.example.com"
                    />
                    {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
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
                      {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
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
                      {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
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
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="position">Position in Organization* (letters only)</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      pattern="^[A-Za-z\s]+$"
                      title="Position should contain only letters"
                      required
                    />
                    {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                  </div>
                  <div>
                    <Label htmlFor="password">Password*</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
                    {errors.licenseNumber && <p className="text-red-500 text-sm">{errors.licenseNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="validityPeriod">
                      License Validity Period* (must be future date, max 5 years from now)
                    </Label>
                    <Input
                      id="validityPeriod"
                      name="validityPeriod"
                      type="date"
                      value={formData.validityPeriod}
                      onChange={handleInputChange}
                      min={currentDate}
                      max={maxValidityDateString}
                      required
                    />
                    {errors.validityPeriod && <p className="text-red-500 text-sm">{errors.validityPeriod}</p>}
                  </div>
                  <div>
                    <Label>Upload Documents*</Label>
                    <div 
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-4 mt-1 cursor-pointer ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
                          </p>
                          <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                            <li>Medical practice license</li>
                            <li>Organization registration certificate</li>
                            <li>Blood bank operation permit</li>
                            <li>Safety compliance certificate</li>
                          </ul>
                          <p className="text-xs text-gray-400 mt-1">
                            (PDF, JPG, PNG, DOC/DOCX up to 5MB each)
                          </p>
                        </div>
                      </div>
                    </div>
                    {errors.documents && <p className="text-red-500 text-sm">{errors.documents}</p>}
                    {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
                  </div>
                  {formData.documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Files:</h4>
                      <ul className="space-y-2">
                        {formData.documents.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
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
                      {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
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
                      {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
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
                    {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
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
                    {errors.facilities && <p className="text-red-500 text-sm">{errors.facilities}</p>}
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
                    {errors.equipmentList && <p className="text-red-500 text-sm">{errors.equipmentList}</p>}
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
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'
                    ) : (
                      'Submit Registration'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer isDarkMode={isDarkMode} />
      <Toaster />
    </div>
  );
};

export default OrganizerRegistration;