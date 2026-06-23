"use client";
import { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export default function LocationPicker({ locations }: { locations: { lat: number, lng: number }[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: 23.8041,
    lng: 90.4152
  });

  useEffect(() => {
    if (locations?.length > 0) {
      setMarkerPosition(locations[0]);
    }
  }, [locations]);

  useEffect(() => {
    if (map) {
      map.panTo(markerPosition);
    }
  }, [markerPosition, map]);


  const googleMapsOptions = useMemo(() => ({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
  }), []);

  const { isLoaded, loadError } = useLoadScript(googleMapsOptions);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="my-4">
      <div style={{ height: "400px", width: "100%" }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={markerPosition}
          zoom={10}
          onLoad={(map) => setMap(map)}
        >
          {/* For single marker */}
          {/* {markerPosition && <Marker position={markerPosition} />} */}

          {/* For multiple markers */}
          {locations.map(({ lat, lng }, index) => (
            <Marker key={`${lat}-${lng}-${index}`} position={{ lat, lng }} />
          ))}

          {/* Radius circle */}
          {/* {markerPosition && (
            <Circle
              center={markerPosition}
              radius={50000} // 5 km
              options={{
                fillColor: "#2563eb",
                fillOpacity: 0.15,
                strokeColor: "#2563eb",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          )} */}

        </GoogleMap>
      </div>
    </div>
  );
}