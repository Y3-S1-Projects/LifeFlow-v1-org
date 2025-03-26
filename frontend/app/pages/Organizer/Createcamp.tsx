"use client";

import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleFromToken, getUserIdFromToken } from "@/app/utils/auth";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import MapComponent from "../../components/Map"; // Import the MapComponent

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Camp name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  operatingHours: z.string().min(5, {
    message: "Operating hours are required.",
  }),
  address: z.object({
    street: z.string().min(3, {
      message: "Street address is required.",
    }),
    city: z.string().min(2, {
      message: "City is required.",
    }),
    postalCode: z.string().min(4, {
      message: "Valid postal code is required.",
    }),
  }),
  status: z.enum(["Open", "Closed", "Full", "Upcoming"]).default("Upcoming"),
  lat: z.string().min(1, {
    message: "Latitude is required.",
  }),
  lng: z.string().min(1, {
    message: "Longitude is required.",
  }),
  availableDates: z
    .object({
      from: z
        .date()
        .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
          message: "Start date cannot be in the past",
        }),
      to: z
        .date()
        .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
          message: "End date cannot be in the past",
        }),
    })
    .refine((data) => data.to >= data.from, {
      message: "End date must be after start date",
      path: ["to"],
    }),
  contact: z.object({
    phone: z.string().min(10, {
      message: "Valid phone number is required.",
    }),
    email: z.string().email({
      message: "Valid email is required.",
    }),
  }),
});

export default function CreateCamp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = React.useState<Date>();
  const [userRole, setUserRole] = useState<string | null>(null);
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://lifeflow-v1-org-production.up.railway.app"
      : "http://localhost:3001";
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      operatingHours: "9:00 AM - 5:00 PM",
      address: {
        street: "",
        city: "",
        postalCode: "",
      },
      status: "Upcoming",
      lat: "",
      lng: "",
      contact: {
        phone: "",
        email: "",
      },
    },
  });

  // Check if user is an organizer
  useEffect(() => {
    // Async function to handle the Promise
    const fetchRole = async () => {
      const role = await getRoleFromToken();
      setUserRole(role);
    };

    fetchRole();
  }, []);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Only proceed if user is an organizer
    if (userRole !== "Organizer") {
      setError("Only organizers can create blood donation camps");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Format the dates for API submission
      const availableDates = [];
      const currentDate = new Date(values.availableDates.from);
      const endDate = new Date(values.availableDates.to);
      const userID = await getUserIdFromToken();

      while (currentDate <= endDate) {
        availableDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const response = await fetch("http://localhost:3001/camps/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          availableDates,
          // The organizer ID would come from the user's session/token
          organizer: userID, // This would be dynamically set in a real app
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create camp");
      }

      toast.success("Camp created successfully!");

      // Navigate back to camps list or detail page on success
      router.push("/organizer/camps");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle location selection from the map
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setValue("lat", lat.toString());
    form.setValue("lng", lng.toString());
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create Blood Donation Camp
          </CardTitle>
          <CardDescription>
            Set up a new blood donation camp event. Fill in all the required
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camp Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., City Hospital Blood Drive"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the blood donation camp..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="E.g., 9:00 AM - 5:00 PM"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Full">Full</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availableDates"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Available Dates</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value && field.value.from ? (
                                field.value.to ? (
                                  `${format(
                                    field.value.from,
                                    "PPP"
                                  )} - ${format(field.value.to, "PPP")}`
                                ) : (
                                  format(field.value.from, "PPP")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="range"
                              selected={{
                                from: field.value?.from,
                                to: field.value?.to,
                              }}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Street address" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Latitude"
                              {...field}
                              readOnly
                              value={
                                selectedLocation?.lat?.toString() ||
                                field.value ||
                                ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Longitude"
                              {...field}
                              readOnly
                              value={
                                selectedLocation?.lng?.toString() ||
                                field.value ||
                                ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Map Component with updated props */}
              <div className="h-96 w-full border rounded-md overflow-hidden">
                <MapComponent
                  userLatitude={selectedLocation?.lat || 0}
                  userLongitude={selectedLocation?.lng || 0}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_API || ""}
                  showNearbyCamps={false}
                  onLocationSelect={handleLocationSelect}
                  isClickable={true}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Latitude: {selectedLocation?.lat || "Not set"}, Longitude:{" "}
                  {selectedLocation?.lng || "Not set"}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Phone number" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Email address" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <CardFooter className="px-0 pt-6 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Camp"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
