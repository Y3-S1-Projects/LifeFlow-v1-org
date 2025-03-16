"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Users, Calendar, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { toast } from "sonner";
import { getUserIdFromToken } from "@/app/utils/auth";
import { RouteGuard } from "@/app/components/RouteGuard";
interface Address {
  street: string;
  city: string;
  postalCode: string;
}

interface Camp {
  _id: string;
  name: string;
  description: string;
  operatingHours: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: Address;
  status: "Upcoming" | "Active" | "Completed" | "Cancelled";
  availableDates: string[];
  contact: {
    phone: string;
    email: string;
  };
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  bloodType: string;
  phoneNumber?: string;
}

const Camps = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [campUsers, setCampUsers] = useState<User[]>([]);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const publicApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const router = useRouter();

  const fetchCamps = async () => {
    const organizerId = await getUserIdFromToken();
    try {
      const response = await axios.get(
        `${publicApi}/camps/get-camps/${organizerId}`
      );
      setCamps(response.data.camps);
    } catch (error) {
      toast.error("Failed to fetch camps");
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [fetchCamps]);

  const fetchCampUsers = async (campId: string) => {
    try {
      const response = await axios.get(`${publicApi}/camps/${campId}/users`);
      setCampUsers(response.data.users || []);
      setIsUsersDialogOpen(true);

      if (!response.data.users || response.data.users.length === 0) {
        toast.info("No users have registered for this camp yet");
      }
    } catch (error) {
      toast.error("Failed to fetch users for this camp");
      setCampUsers([]);
      setIsUsersDialogOpen(true);
    }
  };

  const handleDelete = async (campId: string) => {
    if (confirm("Are you sure you want to delete this camp?")) {
      setIsDeleting(true);
      try {
        await axios.delete(`${publicApi}/camps/delete/${campId}`);
        setCamps(camps.filter((camp) => camp._id !== campId));
        if (selectedCamp && selectedCamp._id === campId) {
          setSelectedCamp(null);
        }
        toast.success("Camp deleted successfully");
      } catch (error) {
        toast.error("Failed to delete camp");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditCamp = (campId: string) => {
    router.push(`${publicApi}/camps/edit/${campId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <RouteGuard requiredRoles={["Organizer"]}>
      <div className="w-full">
        <Header />
        <div className="min-h-screen p-6 w-full md:w-3/4 lg:w-3/4  mx-auto space-y-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-6">
            Blood Donation Camps Dashboard
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Camps</CardTitle>
                  <CardDescription>
                    Manage your blood donation camps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {camps.length > 0 ? (
                      camps.map((camp) => (
                        <div
                          key={camp._id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedCamp && selectedCamp._id === camp._id
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          }`}
                          onClick={() => setSelectedCamp(camp)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{camp.name}</h3>
                              <p className="text-sm text-gray-500">
                                {camp.address.city}
                              </p>
                            </div>
                            <Badge className={getStatusColor(camp.status)}>
                              {camp.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No camps found. Create your first camp to get started.
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push("/organizer/camps/create")}
                  >
                    Create New Camp
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedCamp ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedCamp.name}</CardTitle>
                        <CardDescription>
                          {selectedCamp.description}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditCamp(selectedCamp._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(selectedCamp._id)}
                          disabled={isDeleting}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="dates">Dates</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                      </TabsList>
                      <TabsContent value="details" className="space-y-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge
                            className={getStatusColor(selectedCamp.status)}
                          >
                            {selectedCamp.status}
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">
                            Operating Hours
                          </h3>
                          <p className="text-sm">
                            {selectedCamp.operatingHours}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">
                            Contact Information
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            <span>{selectedCamp.contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="material-icons text-sm">
                              email
                            </span>
                            <span>{selectedCamp.contact.email}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => fetchCampUsers(selectedCamp._id)}
                        >
                          <Users className="h-4 w-4" />
                          View Registered Users
                        </Button>
                      </TabsContent>
                      <TabsContent value="dates" className="mt-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">
                            Available Dates
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedCamp.availableDates.map((date, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm p-2 border rounded-md"
                              >
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>
                                  {format(new Date(date), "MMMM d, yyyy")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="location" className="mt-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Address</h3>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p>{selectedCamp.address.street}</p>
                              <p>
                                {selectedCamp.address.city},{" "}
                                {selectedCamp.address.postalCode}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">
                            Coordinates
                          </h3>
                          <p className="text-sm">
                            Latitude: {selectedCamp.location.coordinates[1]}
                            <br />
                            Longitude: {selectedCamp.location.coordinates[0]}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="mb-4 text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No Camp Selected
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Select a camp from the list to view details or create a
                      new camp.
                    </p>
                    <Button
                      onClick={() => router.push("/organizer/camps/create")}
                    >
                      Create New Camp
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  Registered Users
                  <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {campUsers.length} registered
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {selectedCamp
                    ? `Users registered for ${selectedCamp.name}`
                    : "Users registered for this camp"}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                {campUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.bloodType}</TableCell>
                          <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No users have registered for this camp yet.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Footer isDarkMode={false} />
      </div>
    </RouteGuard>
  );
};

export default Camps;
