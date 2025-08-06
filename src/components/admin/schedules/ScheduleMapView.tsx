import * as React from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import type { SchedulePoint } from './types';

const mapContainerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '0.5rem',
  overflow: 'hidden',
};

const markerColors = {
  start: '#22c55e', // green
  end: '#ef4444',   // red
  normal: '#f59e42', // orange
};

export interface ScheduleMapViewProps {
  points: SchedulePoint[];
}

export function ScheduleMapView({ points }: ScheduleMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) return <div className="w-full h-[220px] flex items-center justify-center">Đang tải bản đồ...</div>;
  if (!points || points.length === 0) return <div className="w-full h-[220px] flex items-center justify-center text-gray-400">Không có dữ liệu bản đồ</div>;

  const center = points[0] ? { lat: points[0].lat, lng: points[0].lng } : { lat: 10.76, lng: 106.68 };
  const path = points.map(p => ({ lat: p.lat, lng: p.lng }));

  const getMarkerIcon = (type: 'start' | 'end' | 'normal') => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: markerColors[type],
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 10,
  });

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={15}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      <Polyline
        path={path}
        options={{ strokeColor: '#2563eb', strokeWeight: 4, strokeOpacity: 0.8 }}
      />
      {points.map((p) => (
        <Marker
          key={p.id}
          position={{ lat: p.lat, lng: p.lng }}
          icon={getMarkerIcon(p.type)}
          title={p.address}
        />
      ))}
    </GoogleMap>
  );
}

export default ScheduleMapView; 