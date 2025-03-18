import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  role: "superadmin" | "moderator" | "support";
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
    role: "moderator",
    nic: "",
  });
  
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [error, setError] = useState<string | null>("Email, password, and NIC are required.");
  const [success, setSuccess] = useState<string | null>(null);

useEffect(() => {
  setError(null);
}, [formData]);

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

  const handleRoleChange = (value: "superadmin" | "moderator" | "support") => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.email || !formData.password || !formData.nic) {
      setError("Email, password, and NIC are required.");
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

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Support Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name:</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name:</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name:</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email:</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address.street">Street:</Label>
                <Input 
                  id="address.street" 
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="address.city">City:</Label>
                  <Input 
                    id="address.city" 
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address.state">State:</Label>
                  <Input 
                    id="address.state" 
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password:</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="grid gap-2">
                <Label>Role:</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={(value) => handleRoleChange(value as "superadmin" | "moderator" | "support")}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="superadmin" id="superadmin" />
                    <Label htmlFor="superadmin">Superadmin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderator" id="moderator" />
                    <Label htmlFor="moderator">Moderator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="support" id="support" />
                    <Label htmlFor="support">Support</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nic">NIC:</Label>
                <Input 
                  id="nic" 
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <CardFooter className="flex justify-center px-0 pt-6 pb-0">
              <Button type="submit" className="w-full">Register</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}