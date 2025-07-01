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
import {
  Trash,
  Edit,
  Users,
  Calendar,
  MapPin,
  Phone,
  Search,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { toast } from "sonner";
import { getUserIdFromToken, getToken } from "@/app/utils/auth";
import { RouteGuard } from "@/app/components/RouteGuard";
import dynamic from "next/dynamic";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { API_BASE_URL } from "@/app/libs/utils";

// Import Map component with dynamic loading to prevent SSR issues
const MapComponent = dynamic(() => import("@/app/components/Map"), {
  ssr: false,
});

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
  approvalStatus: "Pending" | "Approved" | "Rejected"; // Add this
  approvalDetails?: {
    // Add this
    approvedAt?: Date;
    rejectionReason?: string;
  };
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

// PDF Document Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  mapPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCell: {
    fontSize: 10,
  },
});

const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// PDF Report Component
const CampReport = ({ camp }: { camp: Camp }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{camp.name}</Text>
          <Text style={styles.subtitle}>Blood Donation Camp Report</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camp Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{camp.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{camp.description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Operating Hours:</Text>
          <Text style={styles.value}>{camp.operatingHours}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{camp.contact.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{camp.contact.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {camp.address.street}, {camp.address.city},{" "}
            {camp.address.postalCode}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Coordinates:</Text>
          <Text style={styles.value}>
            Latitude: {camp.location.coordinates[1]}, Longitude:{" "}
            {camp.location.coordinates[0]}
          </Text>
        </View>
        <View style={styles.mapPlaceholder}>
          <Text>Map Location</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Dates</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Day</Text>
            </View>
          </View>
          {camp.availableDates.map((date, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {format(new Date(date), "MMMM d, yyyy")}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {format(new Date(date), "EEEE")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Metadata</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Generated On:</Text>
          <Text style={styles.value}>
            {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

const Camps = () => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [campUsers, setCampUsers] = useState<User[]>([]);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchCamps = async () => {
    const organizerId = await getUserIdFromToken();
    try {
      const response = await axios.get(
        `${API_BASE_URL}/camps/get-camps/${organizerId}`
      );
      setCamps(response.data.camps);
    } catch (error) {
      toast.error("Failed to fetch camps");
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCampUsers = async (campId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/camps/${campId}/users`);
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
        const token = getToken();
        await axios.delete(`${API_BASE_URL}/camps/delete/${campId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        });
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
    router.push(`/organizer/camps/edit/${campId}`);
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

  const filteredCamps = camps.filter(
    (camp) =>
      camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Your Camps</CardTitle>
                      <CardDescription>
                        Manage your blood donation camps
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchCamps()}
                      title="Refresh camps list"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Search camps..."
                      className="w-full pl-8 pr-4 py-2 border rounded-md text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    {filteredCamps.length > 0 ? (
                      filteredCamps.map((camp) => (
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
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={getStatusColor(camp.status)}>
                                {camp.status}
                              </Badge>
                              <Badge
                                className={getApprovalStatusColor(
                                  camp.approvalStatus
                                )}
                              >
                                {camp.approvalStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        {searchTerm
                          ? "No matching camps found"
                          : "No camps found. Create your first camp to get started."}
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
                          title="Edit camp"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(selectedCamp._id)}
                          disabled={isDeleting}
                          title="Delete camp"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <PDFDownloadLink
                          document={<CampReport camp={selectedCamp} />}
                          fileName={`${selectedCamp.name.replace(
                            /\s+/g,
                            "_"
                          )}_Report.pdf`}
                        >
                          {({ loading }) => (
                            <Button
                              variant="outline"
                              size="icon"
                              title="Download report"
                              disabled={loading}
                            >
                              {loading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </PDFDownloadLink>
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
                          <Badge
                            className={getApprovalStatusColor(
                              selectedCamp.approvalStatus
                            )}
                          >
                            {selectedCamp.approvalStatus}
                          </Badge>
                        </div>

                        {selectedCamp.approvalStatus === "Rejected" &&
                          selectedCamp.approvalDetails?.rejectionReason && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <h4 className="text-sm font-medium text-red-800">
                                Rejection Reason
                              </h4>
                              <p className="text-sm text-red-700">
                                {selectedCamp.approvalDetails.rejectionReason}
                              </p>
                            </div>
                          )}

                        {selectedCamp.approvalStatus === "Approved" &&
                          selectedCamp.approvalDetails?.approvedAt && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <h4 className="text-sm font-medium text-green-800">
                                Approved On
                              </h4>
                              <p className="text-sm text-green-700">
                                {format(
                                  new Date(
                                    selectedCamp.approvalDetails.approvedAt
                                  ),
                                  "MMMM d, yyyy 'at' h:mm a"
                                )}
                              </p>
                            </div>
                          )}
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

                        {/* Map Component */}
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">
                            Camp Location
                          </h3>
                          <div className="w-full h-80 rounded-md overflow-hidden border">
                            <MapComponent
                              apiKey={apiKey}
                              userLatitude={
                                selectedCamp.location.coordinates[1]
                              }
                              userLongitude={
                                selectedCamp.location.coordinates[0]
                              }
                              showNearbyCamps={false}
                              showAllCamps={true}
                              selectedCampId={selectedCamp._id}
                              onCampSelect={() => {}}
                              isClickable={false}
                            />
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Latitude: {selectedCamp.location.coordinates[1]},
                            Longitude: {selectedCamp.location.coordinates[0]}
                          </div>
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
