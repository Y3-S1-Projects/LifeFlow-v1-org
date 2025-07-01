"use client";

import { useEffect, useState } from "react";
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
import axios from "axios";
import { toast } from "sonner";
import dynamic from "next/dynamic";

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
import { API_BASE_URL } from "@/app/libs/utils";

// Import Map component with dynamic loading to prevent SSR issues
const MapComponent = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
});

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

type FormValues = z.infer<typeof formSchema>;

export default function EditCamp({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campId, setCampId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      operatingHours: "",
      status: "Upcoming",
      availableDates: {
        from: new Date(),
        to: undefined,
      },
      address: {
        street: "",
        city: "",
        postalCode: "",
      },
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

  // Set campId from params
  useEffect(() => {
    if (params && params.id) {
      setCampId(params.id);
    }
  }, [params]);

  // Fetch camp data when component mounts
  useEffect(() => {
    const fetchCampData = async () => {
      if (!campId) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/camps/${campId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch camp data");
        }

        const campData = await response.json();

        // Set selected location for map
        if (campData.location && campData.location.coordinates) {
          // Update to use location coordinates based on the pattern from your first code snippet
          setSelectedLocation({
            lat: parseFloat(campData.location.coordinates[1]),
            lng: parseFloat(campData.location.coordinates[0]),
          });

          // Set lat/lng values in the form
          form.setValue("lat", campData.location.coordinates[1].toString());
          form.setValue("lng", campData.location.coordinates[0].toString());
        } else if (campData.lat && campData.lng) {
          setSelectedLocation({
            lat: parseFloat(campData.lat),
            lng: parseFloat(campData.lng),
          });
        }

        // Format dates for the form
        const formattedData = {
          ...campData,
          availableDates: {
            from: campData.availableDates?.from
              ? new Date(campData.availableDates.from)
              : new Date(),
            to: campData.availableDates?.to
              ? new Date(campData.availableDates.to)
              : undefined,
          },
        };

        // Reset form with fetched data
        form.reset(formattedData);
      } catch (err) {
        console.error("Error fetching camp data:", err);
        setError("Failed to load camp data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (campId) {
      fetchCampData();
    }
  }, [campId, form, API_BASE_URL]);

  // Handle location select from map
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    form.setValue("lat", lat.toString());
    form.setValue("lng", lng.toString());
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    // Only proceed if user is an organizer
    if (userRole !== "Organizer") {
      setError("Only organizers can edit blood donation camps");
      return;
    }

    if (!campId) {
      setError("Camp ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Format the dates for API submission
      const availableDates = [];
      const currentDate = new Date(data.availableDates.from);
      const endDate = new Date(data.availableDates.to);

      while (currentDate <= endDate) {
        availableDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const response = await fetch(`${API_BASE_URL}/camps/update/${campId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          ...data,
          availableDates,
          location: {
            type: "Point",
            coordinates: [parseFloat(data.lng), parseFloat(data.lat)],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update camp");
      }

      toast.success("Camp updated successfully!");
      // Navigate back to camps list or detail page on success
      router.push("/organizer/camps");
    } catch (err: any) {
      console.error("Error updating camp:", err);
      setError(err.message || "Failed to update camp. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Edit Blood Donation Camp
          </CardTitle>
          <CardDescription>
            Update the details of your blood donation camp.
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

          {loading && !error && !form.formState.isSubmitting ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading camp data...</span>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          value={field.value}
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
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
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
                    showAllCamps={true}
                    //selectedCampId={campId || ""}
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
                  <Button
                    type="submit"
                    disabled={loading || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Updating..."
                      : "Update Camp"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
