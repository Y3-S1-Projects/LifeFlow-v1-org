import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, UserPlus, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Address {
  street: string;
  city: string;
  state: string;
}

interface FormData {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
  password: string;
  role: "superadmin" | "support";
  nic: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
    },
    password: "",
    role: "support",
    nic: "",
  });
  
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [error, setError] = useState<string | null>("Email, password, and NIC are required.");
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  useEffect(() => {
    setError(null);
  }, [formData]);

  // Password strength calculation
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (formData.password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(formData.password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(formData.password)) strength += 1;
    
    // Contains numbers
    if (/[0-9]/.test(formData.password)) strength += 1;
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  // Email validation
  useEffect(() => {
    if (!formData.email) {
      setEmailValid(null);
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmailValid(emailRegex.test(formData.email));
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1] as keyof Address;
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleRoleChange = (value: "superadmin" | "support") => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Enhanced validation
    if (!formData.email || !formData.password || !formData.nic) {
      setError("Email, password, and NIC are required.");
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password strength validation
    if (passwordStrength < 3) {
      setError("Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.");
      return;
    }

    try {
      const csrfResponse = await axios.get(`${publicApi}/api/csrf-token`, {
        withCredentials: true,
      });
      const csrfToken = csrfResponse.data.csrfToken;
      
      const response = await fetch(`${publicApi}/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const result = await response.json();
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Function to get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-green-400";
    return "bg-green-600";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-1">
          <CardHeader className="bg-white rounded-t-lg pt-6 pb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-red-700 p-3 rounded-full shadow-md">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
              Blood Donation Support Registration
            </CardTitle>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 bg-green-50 border border-green-200 flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                  className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required 
                    className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder="First name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required 
                    className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Email Address</span>
                  {emailValid !== null && (
                    <span className={`text-xs ${emailValid ? 'text-green-600' : 'text-red-600'}`}>
                      {emailValid ? 'Valid email' : 'Invalid email format'}
                    </span>
                  )}
                </Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  className={`rounded-md transition-all ${
                    emailValid === null ? 'border-gray-300' : 
                    emailValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : 
                    'border-red-500 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address.street" className="text-sm font-medium text-gray-700">Street Address</Label>
                <Input 
                  id="address.street" 
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required 
                  className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address.city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input 
                    id="address.city" 
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required 
                    className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder="City"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address.state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input 
                    id="address.state" 
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required 
                    className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Password</span>
                  <span className="text-xs text-gray-500">
                    {passwordStrength === 0 ? 'Enter password' : 
                     passwordStrength <= 2 ? 'Weak' : 
                     passwordStrength <= 3 ? 'Medium' : 
                     passwordStrength <= 4 ? 'Strong' : 'Very Strong'}
                  </span>
                </Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="Create a secure password"
                />
                <div className="h-1 w-full bg-gray-200 rounded mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all`}
                    style={{width: `${passwordStrength * 20}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password should be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                <Label className="text-sm font-medium text-gray-700">Select Your Role</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={(value) => handleRoleChange(value as "superadmin" | "support")}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center justify-center p-3 border rounded-md hover:bg-red-50 cursor-pointer transition-all border-gray-200">
                    <RadioGroupItem value="superadmin" id="superadmin" className="mr-2 text-red-600" />
                    <Label htmlFor="superadmin" className="cursor-pointer text-sm">Superadmin</Label>
                  </div>
                  <div className="flex items-center justify-center p-3 border rounded-md hover:bg-red-50 cursor-pointer transition-all border-gray-200">
                    <RadioGroupItem value="support" id="support" className="mr-2 text-red-600" />
                    <Label htmlFor="support" className="cursor-pointer text-sm">Support</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nic" className="text-sm font-medium text-gray-700">NIC</Label>
                <Input 
                  id="nic" 
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  required 
                  className="rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500 transition-all"
                  placeholder="National Identity Card number"
                />
              </div>
            </div>

            <CardFooter className="flex justify-center px-0 pt-8 pb-0">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-medium py-3 rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Create Account
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}