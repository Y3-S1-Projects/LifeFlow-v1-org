import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import { MapPin, Clock, Phone, Calendar, Users, Info } from "lucide-react";

interface Camp {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: string;
  operatingHours?: string;
  availableDates: string[];
  slotsAvailable?: number;
  contact?: {
    phone?: string;
    email?: string;
  };
}

interface IMapProps {
  apiKey: string;
  userLatitude: number;
  userLongitude: number;
  showNearbyCamps?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedCampId?: string;
  onCampSelect?: (campId: string) => void;
  isClickable?: boolean; // New prop to control if the map is interactive
}

const MapComponent: React.FC<IMapProps> = ({
  apiKey,
  userLatitude,
  userLongitude,
  showNearbyCamps = false,
  onLocationSelect,
  selectedCampId,
  onCampSelect,
  isClickable = true, // Default to true for backward compatibility
}) => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const defaultLocation = { lat: 6.9271, lng: 79.8612 }; // Colombo (default)

  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    defaultLocation
  );

  // Use the useJsApiLoader hook instead of LoadScript component
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (userLatitude !== undefined && userLongitude !== undefined) {
      setCenter({ lat: userLatitude, lng: userLongitude });
    }
  }, [userLatitude, userLongitude]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (selectedCampId) {
      setSelectedCamp(selectedCampId);
    }
  }, [selectedCampId]);

  const mapContainerStyle = {
    width: "100%",
    height: isMobile ? "calc(100vh - 64px)" : "500px",
    maxWidth: "100vw",
  };

  const mapStyles = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#a0d3e8" }],
    },
  ];

  useEffect(() => {
    const fetchNearbyCamps = async () => {
      if (!showNearbyCamps) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/camps/nearby?lat=${userLatitude}&lng=${userLongitude}&radius=20`
        );
        setCamps(response.data);
        if (selectedCampId) {
          setSelectedCamp(selectedCampId);
        }
      } catch (error) {
        console.error("Error fetching camps:", error);
      }
    };

    if (userLatitude && userLongitude) {
      fetchNearbyCamps();
    }
  }, [userLatitude, userLongitude, showNearbyCamps, selectedCampId]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    // Only handle clicks if the map is clickable
    if (!isClickable) return;

    if (showNearbyCamps) {
      setSelectedCamp(null);
      if (onCampSelect) {
        onCampSelect("");
      }
      return;
    }

    const { latLng } = event;
    if (latLng) {
      const lat = latLng.lat();
      const lng = latLng.lng();
      setSelectedLocation({ lat, lng });

      setCenter({ lat, lng });

      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    }
  };

  const handleMarkerClick = (campId: string) => {
    // Only handle marker clicks if the map is clickable
    if (!isClickable) return;

    setSelectedCamp(campId);
    if (onCampSelect) {
      onCampSelect(campId);
    }
  };

  const handleScheduleClick = (campId: string) => {
    // Only handle schedule clicks if the map is clickable
    if (!isClickable) return;

    if (onCampSelect) {
      onCampSelect(campId);
    }
  };

  const defaultZoom = 12;

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="relative w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={defaultZoom}
        onClick={handleMapClick}
        options={{
          restriction: {
            latLngBounds: {
              north: 10.0,
              south: 5.0,
              west: 79.0,
              east: 82.0,
            },
            strictBounds: true,
          },
          disableDefaultUI: isMobile,
          zoomControl: isClickable && !isMobile,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: isClickable && !isMobile,
          styles: mapStyles,
          gestureHandling: isClickable
            ? isMobile
              ? "greedy"
              : "cooperative"
            : "none", // Disable gestures if not clickable
          draggable: isClickable, // Disable dragging if not clickable
          clickableIcons: isClickable, // Disable POI clicks if not clickable
          scrollwheel: isClickable, // Disable zoom on scroll if not clickable
          keyboardShortcuts: isClickable, // Disable keyboard shortcuts if not clickable
        }}
      >
        {userLatitude && userLongitude && (
          <Marker
            position={{ lat: userLatitude, lng: userLongitude }}
            label={{
              text: "You",
              color: "#4285F4",
              fontWeight: "bold",
              fontSize: "16px",
              className:
                "font-poppins bg-white px-2 py-1 rounded-full shadow-md border-2 border-blue-500",
            }}
            zIndex={1000}
            clickable={isClickable} // Disable marker click if map is not clickable
          />
        )}
        {showNearbyCamps &&
          camps.map((camp) => {
            let labelColor, borderColor;
            switch (camp.status) {
              case "Open":
                labelColor = "#16A34A";
                borderColor = "border-green-500";
                break;
              case "Closed":
                labelColor = "#DC2626";
                borderColor = "border-red-500";
                break;
              case "Upcoming":
                labelColor = "#CA8A04";
                borderColor = "border-yellow-500";
                break;
              case "Full":
                labelColor = "#2563EB";
                borderColor = "border-blue-500";
                break;
              default:
                labelColor = "#6B7280";
                borderColor = "border-gray-500";
                break;
            }

            return (
              <Marker
                key={camp._id}
                position={{
                  lat: camp.location.coordinates[1],
                  lng: camp.location.coordinates[0],
                }}
                onClick={() => handleMarkerClick(camp._id)}
                label={{
                  text: camp.name,
                  className: `font-poppins ${
                    isMobile ? "text-xs" : "text-sm"
                  } bg-white px-2 py-1 rounded-full shadow-md border-2 ${borderColor}`,
                  color: labelColor,
                  fontSize: isMobile ? "12px" : "14px",
                }}
                clickable={isClickable} // Disable marker click if map is not clickable
              >
                {selectedCamp === camp._id && isClickable && (
                  <InfoWindow
                    position={{
                      lat: camp.location.coordinates[1],
                      lng: camp.location.coordinates[0],
                    }}
                    onCloseClick={() => {
                      setSelectedCamp(null);
                      if (onCampSelect) onCampSelect("");
                    }}
                  >
                    <div
                      className={`p-4 ${
                        isMobile ? "max-w-[300px]" : "max-w-md"
                      } rounded-lg bg-white shadow-sm`}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          className="bg-red-100 p-2.5 rounded-full touch-manipulation cursor-pointer hover:bg-red-200 active:bg-red-300 transition-colors flex-shrink-0"
                          onClick={() => handleScheduleClick(camp._id)}
                          aria-label="Blood Donation Icon"
                        >
                          <span className="text-red-600 text-xl block leading-none select-none">
                            🩸
                          </span>
                        </button>
                        <div>
                          <h3
                            className={`${
                              isMobile ? "text-lg" : "text-xl"
                            } font-bold text-gray-900 mb-1`}
                          >
                            {camp.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${
                                camp.status === "Open"
                                  ? "bg-green-500"
                                  : camp.status === "Closed"
                                  ? "bg-red-500"
                                  : camp.status === "Upcoming"
                                  ? "bg-yellow-500"
                                  : camp.status === "Full"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                              }`}
                            ></span>
                            <p
                              className={`${
                                isMobile ? "text-xs" : "text-sm"
                              } font-medium text-gray-700`}
                            >
                              {camp.status === "Open"
                                ? "Open for Donations"
                                : camp.status === "Closed"
                                ? "Closed for Donations"
                                : camp.status === "Full"
                                ? "Camp is Full"
                                : camp.status === "Upcoming"
                                ? "Upcoming Camp"
                                : "Status Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span
                            className={`${
                              isMobile ? "text-xs" : "text-sm"
                            } text-gray-600`}
                          >
                            {camp.operatingHours || "9:00 AM - 5:00 PM"}
                          </span>
                        </div>

                        {/* Available Dates Section */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span
                              className={`${
                                isMobile ? "text-xs" : "text-sm"
                              } font-medium text-gray-700`}
                            >
                              Available Dates:
                            </span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {camp.availableDates.map((date, index) => (
                              <span
                                key={index}
                                className={`${
                                  isMobile ? "text-xs" : "text-sm"
                                } text-gray-600 block`}
                              >
                                {new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span
                            className={`${
                              isMobile ? "text-xs" : "text-sm"
                            } text-gray-600`}
                          >
                            {camp.contact?.phone || "Phone TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Action Button*/}
                      <div className="flex gap-2">
                        <button
                          className={`flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 active:bg-red-800 transition-colors ${
                            isMobile ? "text-sm" : "text-base"
                          }`}
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${camp.location.coordinates[1]},${camp.location.coordinates[0]}`,
                              "_blank"
                            )
                          }
                        >
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        {selectedLocation && !showNearbyCamps && (
          <Marker
            position={selectedLocation}
            clickable={isClickable} // Disable marker click if map is not clickable
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
