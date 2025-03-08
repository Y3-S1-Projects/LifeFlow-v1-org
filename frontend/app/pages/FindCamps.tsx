import React, { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Globe,
  Locate,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";
import Link from "next/link";

const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false,
});

const BloodCampLocations: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState<string | undefined>(
    undefined
  );
  const [campDisplayMode, setCampDisplayMode] = useState<"nearby" | "all">(
    "nearby"
  );
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API || "";

  const fetchUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Unable to retrieve location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          setLocationError(errorMessage);
          setIsLocationDialogOpen(true);

          // Set a default location if geolocation fails
          setUserLocation({
            latitude: 6.9271,
            longitude: 79.8612, // Colombo default
          });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocationDialogOpen(true);
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const handleCampSelect = (campId: string) => {
    setSelectedCampId(campId);
  };

  return (
    <div className="w-full">
      <GlobalHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <div className="min-h-screen p-4 md:p-6 w-full md:w-4/5 lg:w-3/4 mx-auto space-y-6 flex flex-col mt-10">
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-6xl mx-auto shadow-lg rounded-xl overflow-hidden border border-neutral-200">
            <CardHeader className="bg-primary text-primary-foreground py-5 px-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Users className="w-7 h-7" />
                  <h2 className="text-xl font-semibold">
                    Blood Donation Camps
                  </h2>
                </div>
                {userLocation && (
                  <Button
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary/10"
                    onClick={fetchUserLocation}
                  >
                    <Locate className="mr-2 h-4 w-4" /> Refresh Location
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Account Benefits Section */}
              <div className="bg-white p-5 rounded-lg border border-neutral-200 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold text-primary mb-4">
                  Benefits of Creating an Account
                </h3>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Book appointments for blood donation camps
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Earn points and redeem rewards
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Track donation history and milestones
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    Receive notifications about camps and urgent needs
                  </li>
                </ul>
                <div className="mt-5">
                  <Link href="/donor/register" passHref>
                    <Button className="bg-primary hover:bg-primary/90">
                      <UserPlus className="mr-2 h-4 w-4" /> Register
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Camp Display Mode Selection */}
              <div className="flex justify-center mb-6 space-x-4">
                <Button
                  variant={campDisplayMode === "nearby" ? "default" : "outline"}
                  onClick={() => setCampDisplayMode("nearby")}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Nearby Camps
                </Button>

                <Button
                  variant={campDisplayMode === "all" ? "default" : "outline"}
                  onClick={() => setCampDisplayMode("all")}
                  className="flex items-center gap-2"
                >
                  <Globe className="w-5 h-5" />
                  All Camps
                </Button>
              </div>

              {/* Map Container */}
              <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-md border border-neutral-200">
                {userLocation && (
                  <MapComponent
                    apiKey={apiKey}
                    userLatitude={userLocation.latitude}
                    userLongitude={userLocation.longitude}
                    showNearbyCamps={campDisplayMode === "nearby"}
                    showAllCamps={campDisplayMode === "all"}
                    selectedCampId={selectedCampId}
                    onCampSelect={handleCampSelect}
                    isClickable={true}
                  />
                )}
              </div>

              {/* Information Badge */}
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {campDisplayMode === "nearby"
                    ? "Showing blood donation camps near your location"
                    : "Showing all blood donation camps"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Error Dialog */}
        <Dialog
          open={isLocationDialogOpen}
          onOpenChange={setIsLocationDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary">
                Location Access
              </DialogTitle>
              <DialogDescription>
                {locationError || "Unable to retrieve your location"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLocationDialogOpen(false);
                  fetchUserLocation();
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsLocationDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer isDarkMode={false} />
    </div>
  );
};

export default BloodCampLocations;
