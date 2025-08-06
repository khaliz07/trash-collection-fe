"use client";
import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { CollectionPoint, CollectionStatus } from '@/types/collection';
import { mockMapCollectionPoints } from './mockData';
import { FilterBar } from './FilterBar';
import { CollectionPointMapPopup } from './CollectionPointMapPopup';
import { UserLocation } from './types';

const STATUS_COLORS = {
  [CollectionStatus.PENDING]: '#f59e42',
  [CollectionStatus.IN_PROGRESS]: '#3b82f6',
  [CollectionStatus.COMPLETED]: '#22c55e',
  [CollectionStatus.CANNOT_COLLECT]: '#ef4444',
};

function useCurrentLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => setLocation(null),
      { enableHighAccuracy: true }
    );
  }, []);
  return location;
}

const mapContainerStyle = {
  width: '100%',
  height: '60vh',
  minHeight: 400,
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

export function MapView() {
  const [filterStatus, setFilterStatus] = useState<CollectionStatus[]>([]);
  const [search, setSearch] = useState('');
  const [points, setPoints] = useState<CollectionPoint[]>(mockMapCollectionPoints);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const userLocation = useCurrentLocation();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Filter points
  const filteredPoints = points.filter((p) => {
    const matchStatus = filterStatus.length === 0 || filterStatus.includes(p.status);
    const matchSearch =
      !search ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Handle check-in (mock)
  const handleCheckIn = (id: string) => {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: CollectionStatus.IN_PROGRESS, checkInTime: new Date().toLocaleTimeString() }
          : p
      )
    );
    setActivePointId(id);
  };

  // Handle navigation (open Google Maps)
  const handleNavigate = (point: CollectionPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.location.lat},${point.location.lng}`;
    window.open(url, '_blank');
  };

  // Center map on user location
  useEffect(() => {
    if (map && userLocation) {
      map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      map.setZoom(15);
    }
  }, [userLocation, map]);

  // Custom marker icon (colored dot)
  const getMarkerIcon = (status: CollectionStatus) => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: STATUS_COLORS[status],
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 10,
  });

  const getUserIcon = () => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#2563eb',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 3,
    scale: 12,
  });

  if (!isLoaded) return <div className="w-full h-[60vh] flex items-center justify-center">Đang tải bản đồ...</div>;

  return (
    <div className="w-full rounded-lg overflow-hidden relative">
      <FilterBar
        status={filterStatus}
        onStatusChange={setFilterStatus}
        search={search}
        onSearchChange={setSearch}
      />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 10.729567, lng: 106.694255 }}
        zoom={14}
        onLoad={setMap}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={getUserIcon()}
            title="Vị trí của bạn"
          />
        )}
        {filteredPoints.map((point) => (
          <Marker
            key={point.id}
            position={{ lat: point.location.lat, lng: point.location.lng }}
            icon={getMarkerIcon(point.status)}
            onClick={() => setActivePointId(point.id)}
            title={`Điểm thu gom #${point.id}`}
          >
            {activePointId === point.id && (
              <InfoWindow
                position={{ lat: point.location.lat, lng: point.location.lng }}
                onCloseClick={() => setActivePointId(null)}
              >
                <div>
                  <CollectionPointMapPopup
                    point={point}
                    onCheckIn={() => handleCheckIn(point.id)}
                    onNavigate={() => handleNavigate(point)}
                  />
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
} 