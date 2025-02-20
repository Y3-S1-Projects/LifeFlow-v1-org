// components/MapComponent.tsx
import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface IMapProps {
  apiKey: string;
}

const MapComponent: React.FC<IMapProps> = ({ apiKey }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerStyle = {
    width: "100%",
    height: "500px", // Increased height for better visibility
  };

  // Centering on Sri Lanka
  const center: google.maps.LatLngLiteral = {
    lat: 7.8731, // Latitude for Sri Lanka
    lng: 80.7718, // Longitude for Sri Lanka
  };

  // Example marker in Colombo (You can add more markers dynamically)
  const markerPosition: google.maps.LatLngLiteral = {
    lat: 6.9271,
    lng: 79.8612,
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={7} // Suitable zoom to fit Sri Lanka
        onLoad={() => setMapLoaded(true)}
        options={{
          restriction: {
            latLngBounds: {
              north: 10.0, // Northern boundary of Sri Lanka
              south: 5.0, // Southern boundary
              west: 79.0, // Western boundary
              east: 82.0, // Eastern boundary
            },
            strictBounds: true, // Prevents panning outside Sri Lanka
          },
        }}
      >
        {mapLoaded && <Marker position={markerPosition} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
