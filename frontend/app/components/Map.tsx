import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";

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
}

const MapComponent: React.FC<IMapProps> = ({
  apiKey,
  userLatitude,
  userLongitude,
  showNearbyCamps = false,
  onLocationSelect,
}) => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<string | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  const center: google.maps.LatLngLiteral = {
    lat: userLatitude || 7.8731,
    lng: userLongitude || 80.7718,
  };

  // Custom Map Style to show only city names
  const mapStyles = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [
        {
          visibility: "off", // Hide all labels
        },
      ],
    },
    {
      featureType: "administrative.locality", // Show only city names
      elementType: "labels",
      stylers: [
        {
          visibility: "on", // Only show locality (city) names
        },
      ],
    },
    {
      featureType: "poi", // Hide points of interest (like parks, places)
      elementType: "labels",
      stylers: [
        {
          visibility: "off", // Hide POI labels
        },
      ],
    },
    {
      featureType: "road", // Hide road labels
      elementType: "labels",
      stylers: [
        {
          visibility: "off", // Hide road labels
        },
      ],
    },
    {
      featureType: "water", // Show water bodies
      elementType: "geometry",
      stylers: [
        {
          color: "#a0d3e8", // Set color for water bodies
        },
      ],
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
      } catch (error) {
        console.error("Error fetching camps:", error);
      }
    };

    if (userLatitude && userLongitude) {
      fetchNearbyCamps();
    }
  }, [userLatitude, userLongitude, showNearbyCamps]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (showNearbyCamps) {
      setSelectedCamp(null);
      return;
    }

    const { latLng } = event;
    if (latLng) {
      const lat = latLng.lat();
      const lng = latLng.lng();
      setSelectedLocation({ lat, lng });
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    }
  };

  const handleMarkerClick = (campId: string) => {
    setSelectedCamp(selectedCamp === campId ? null : campId);
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
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
          disableDefaultUI: false, // Disable default UI controls
          zoomControl: true, // Enable zoom control
          streetViewControl: false, // Disable street view control
          mapTypeControl: false, // Hide map type control
          fullscreenControl: true, // Disable fullscreen control
          styles: mapStyles, // Apply the custom styles
        }}
      >
        {mapLoaded &&
          showNearbyCamps &&
          camps.map((camp) => (
            <Marker
              key={camp._id}
              position={{
                lat: camp.location.coordinates[1],
                lng: camp.location.coordinates[0],
              }}
              onClick={() => handleMarkerClick(camp._id)}
              label={{
                text: camp.name,
                className:
                  "font-poppins text-sm bg-white px-3 py-1 rounded-full shadow-md border-2 border-red-500",
                color: "#DC2626",
                fontSize: "14px",
              }}
            >
              {selectedCamp === camp._id && (
                <InfoWindow
                  position={{
                    lat: camp.location.coordinates[1],
                    lng: camp.location.coordinates[0],
                  }}
                  onCloseClick={() => setSelectedCamp(null)}
                >
                  <div className="p-4 max-w-xs rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-red-100 p-2 rounded-full">
                        <div className="text-red-600 text-xl font-bold">🩸</div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {camp.name}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            camp.status === "Open"
                              ? "bg-green-500"
                              : camp.status === "Closed"
                              ? "bg-red-500"
                              : camp.status === "Upcoming"
                              ? "bg-yellow-500"
                              : camp.status === "Full"
                              ? "bg-blue-500" // Replace with user-specific color if needed
                              : "bg-gray-500"
                          }`}
                        ></span>
                        <p className="text-sm font-medium capitalize">
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

                      <button className="w-full mt-3 bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors">
                        Schedule Donation
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}

        {selectedLocation && !showNearbyCamps && (
          <Marker position={selectedLocation}>
            <InfoWindow
              position={selectedLocation}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div>Selected Location</div>
            </InfoWindow>
          </Marker>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
