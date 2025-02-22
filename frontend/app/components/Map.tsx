import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";

// Previous interfaces remain the same
interface Camp {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: string;
}

interface IMapProps {
  apiKey: string;
  userLatitude: number;
  userLongitude: number;
  showNearbyCamps?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedCampId?: string;
  onCampSelect?: (campId: string) => void;
}

const MapComponent: React.FC<IMapProps> = ({
  apiKey,
  userLatitude,
  userLongitude,
  showNearbyCamps = false,
  onLocationSelect,
  selectedCampId,
  onCampSelect,
}) => {
  // Previous state declarations remain the same
  const [camps, setCamps] = useState<Camp[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [center, setCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Default location

  // Mobile detection effect remains the same
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

  // Previous styles and map configuration remain the same
  const mapContainerStyle = {
    width: "100%",
    height: isMobile ? "calc(100vh - 64px)" : "500px",
    maxWidth: "100vw",
  };

  // const center: google.maps.LatLngLiteral = {
  //   lat: userLatitude || 7.8731,
  //   lng: userLongitude || 80.7718,
  // };

  // Previous map styles remain the same
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

  // Previous useEffect for fetching camps remains the same
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

  // Previous event handlers remain the same
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
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

      // Set the new center for the map to the clicked location
      setCenter({ lat, lng });

      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    }
  };

  const handleMarkerClick = (campId: string) => {
    setSelectedCamp(campId);
    if (onCampSelect) {
      onCampSelect(campId);
    }
  };

  const handleScheduleClick = (campId: string) => {
    if (onCampSelect) {
      onCampSelect(campId);
    }
  };
  const defaultZoom = 1;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div className="relative w-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={defaultZoom}
          onLoad={() => setMapLoaded(true)}
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
            zoomControl: !isMobile,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: !isMobile,
            styles: mapStyles,
            gestureHandling: isMobile ? "greedy" : "cooperative",
          }}
        >
          {mapLoaded &&
            showNearbyCamps &&
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
                >
                  {selectedCamp === camp._id && (
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
                        className={`p-3 ${
                          isMobile ? "max-w-[280px]" : "max-w-xs"
                        } rounded-lg`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {/* Modified blood donation icon container for better touch interaction */}
                          <button
                            className="bg-red-100 p-2 rounded-full touch-manipulation cursor-pointer active:bg-red-200 transition-colors"
                            onClick={() => handleScheduleClick(camp._id)}
                            aria-label="Blood Donation Icon"
                          >
                            <span className="text-red-600 text-lg block leading-none select-none">
                              🩸
                            </span>
                          </button>
                          <h3
                            className={`${
                              isMobile ? "text-lg" : "text-xl"
                            } font-bold text-gray-900`}
                          >
                            {camp.name}
                          </h3>
                        </div>

                        <div className="space-y-2">
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
                              } font-medium capitalize`}
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

                          <button
                            className={`w-full mt-2 bg-red-600 text-white py-1.5 px-3 rounded-md font-medium hover:bg-red-700 active:bg-red-800 transition-colors ${
                              isMobile ? "text-sm" : "text-base"
                            }`}
                            onClick={() => handleScheduleClick(camp._id)}
                          >
                            Schedule Donation
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          {selectedLocation && !showNearbyCamps && (
            <Marker position={selectedLocation}>
              {/* <InfoWindow
                position={selectedLocation}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <div className={isMobile ? "text-sm" : "text-base"}>
                  Selected Location
                </div>
              </InfoWindow> */}
            </Marker>
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default MapComponent;
