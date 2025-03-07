import { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Building,
  User,
} from "lucide-react";
import Loader from "../../components/Loader";
import useUser from "../../hooks/useUser";
import axios from "axios";
import { format } from "date-fns";
const Header = lazy(() => import("../../components/Header"));
import Footer from "../../components/Footer";
import { RouteGuard } from "../../components/RouteGuard";
import { useRouter } from "next/navigation";

const OrganizerProfile = () => {
  const { user, loading, error, refetch } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("view");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    organization: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
    },
    additionalInfo: "",
  });
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Update formData when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        fullName: user?.fullName || "",
        email: user.email || "",
        organization: user.organization || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
        },
        additionalInfo: user.additionalInfo || "",
      });

      if (user.lastDonationDate) {
        setDate(new Date(user.lastDonationDate));
      }
    }
  }, [user]); // Dependency on user

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!user || user.role != "Organizer") {
    router.push("/unauthorized");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<string, any>),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.put(
        `${publicApi}/organizers/update`,
        {
          ...formData,
          lastDonationDate: date ? format(date, "yyyy-MM-dd") : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSaveSuccess(true);
      await refetch();
      setTimeout(() => {
        setActiveTab("view");
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <RouteGuard requiredRoles={["Organizer"]}>
      <div className="w-full">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          }
        >
          <Header />
          <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4  mx-auto space-y-6 flex flex-col">
            <Tabs
              defaultValue="view"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                  Organizer Profile
                </h1>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="view">View Profile</TabsTrigger>
                  <TabsTrigger value="edit">Edit Profile</TabsTrigger>
                  <TabsTrigger value="events">My Events</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="view">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1">
                    <CardHeader className="flex flex-col items-center">
                      <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-4">
                        <AvatarImage
                          src="/avatar-placeholder.png"
                          alt={user.name || "Organizer"}
                        />
                        <AvatarFallback className="text-xl">
                          {getInitials(user.name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg md:text-xl">
                        {user.fullName || "Unnamed Organizer"}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                      <div className="mt-2">
                        <Badge
                          variant={
                            user.eligibleToOrganize ? "default" : "outline"
                          }
                          className="mr-2"
                        >
                          {user.eligibleToOrganize
                            ? "Eligible to Organize"
                            : "Pending Approval"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {user.organization || "No organization specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{user.phone || "No phone number"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                      {user.address &&
                        (user.address.city || user.address.state) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {[
                                user.address.street,
                                user.address.city,
                                user.address.state,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      {user.lastDonationDate && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Last donation:{" "}
                            {new Date(
                              user.lastDonationDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("edit")}
                      >
                        Edit Profile
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Organization Details</CardTitle>
                      <CardDescription>
                        Information about your organization and past events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          About the Organization
                        </h3>
                        <p className="text-muted-foreground mt-2">
                          {user.additionalInfo ||
                            "No additional information provided."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium">Status</h3>
                        <div className="flex items-center mt-2">
                          {user.eligibleToOrganize ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>
                                Your account is approved to organize blood
                                donation events.
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                              <span>
                                Your account is pending approval. Our team will
                                review your information shortly.
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium">Next Steps</h3>
                        <ul className="list-disc list-inside mt-2 text-muted-foreground">
                          <li>Complete your profile information</li>
                          <li>Verify your organization details</li>
                          <li>Plan your first blood donation event</li>
                          <li>Reach out to potential donors</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="edit">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal and organization details
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                      {saveSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle>Success</AlertTitle>
                          <AlertDescription>
                            Your profile has been updated successfully!
                          </AlertDescription>
                        </Alert>
                      )}

                      {saveError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName" // Match the key in formData
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Your first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName" // Match the key in formData
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Your last name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName" // Match the key in formData
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email" // Match the key in formData
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Your email address"
                            type="email"
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organization">
                            Organization Name
                          </Label>
                          <Input
                            id="organization"
                            name="organization" // Match the key in formData
                            value={formData.organization}
                            onChange={handleInputChange}
                            placeholder="Name of your organization"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone" // Match the key in formData
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Contact phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Address</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            name="address.street" // Match the nested key in formData
                            value={formData.address.street}
                            onChange={handleInputChange}
                            placeholder="Street address"
                          />
                          <Input
                            name="address.city" // Match the nested key in formData
                            value={formData.address.city}
                            onChange={handleInputChange}
                            placeholder="City"
                          />
                          <Input
                            name="address.state" // Match the nested key in formData
                            value={formData.address.state}
                            onChange={handleInputChange}
                            placeholder="State/Province"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastDonation">
                          Last Organized Donation Event
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">
                          About Organization
                        </Label>
                        <Textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleInputChange}
                          placeholder="Share details about your organization and its mission..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("view")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardHeader>
                    <CardTitle>My Events</CardTitle>
                    <CardDescription>
                      Manage your blood donation events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="mx-auto bg-muted rounded-full h-12 w-12 flex items-center justify-center mb-4">
                        <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No Events Yet</h3>
                      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You haven't created any blood donation events yet.
                        Create your first event to start helping your community.
                      </p>
                      <Button className="mt-4">Create New Event</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <Footer isDarkMode={false} />
        </Suspense>
      </div>
    </RouteGuard>
  );
};

export default OrganizerProfile;
