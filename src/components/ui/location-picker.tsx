"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import { reverseGeocode } from "@/lib/geocoding";

// Dynamic import to avoid SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  { ssr: false }
);

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialLocation?: {
    address: string;
    lat: number;
    lng: number;
  };
}

export default function LocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const { t } = useTranslation("common");

  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      address: "",
      lat: 10.8231, // Default to Ho Chi Minh City
      lng: 106.6297,
    }
  );

  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);

  // Handle map click to select location
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  }, []);

  // Get current location using geolocation API
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setIsLoadingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get address from coordinates using reverse geocoding
          const address = await reverseGeocode(latitude, longitude);
          
          setSelectedLocation({
            address,
            lat: latitude,
            lng: longitude,
          });
        } catch (error) {
          console.error('Error getting address:', error);
          // Still set coordinates even if address lookup fails
          setSelectedLocation((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
          }));
        }
        
        setIsLoadingCurrentLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Không thể lấy vị trí hiện tại. Vui lòng thử lại.");
        setIsLoadingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  // Handle address input change
  const handleAddressChange = (address: string) => {
    setSelectedLocation((prev) => ({
      ...prev,
      address,
    }));
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (!selectedLocation.address.trim()) {
      alert("Vui lòng nhập địa chỉ thu gom.");
      return;
    }

    onLocationSelect(selectedLocation);
    onClose();
  };

  // Prepare map data
  const mapPoints =
    selectedLocation.lat && selectedLocation.lng
      ? [
          {
            id: "selected-location",
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            address: selectedLocation.address || "Vị trí đã chọn",
            type: "pickup" as const,
          },
        ]
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Chọn vị trí thu gom
          </DialogTitle>
          <DialogDescription>
            Nhập địa chỉ và chọn vị trí chính xác trên bản đồ để yêu cầu thu
            gom.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address Input */}
          <div>
            <Label htmlFor="pickup-address">Địa chỉ thu gom *</Label>
            <Input
              id="pickup-address"
              placeholder="Nhập địa chỉ chi tiết..."
              value={selectedLocation.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Get Current Location Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLoadingCurrentLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isLoadingCurrentLocation
                ? "Đang lấy vị trí..."
                : "Sử dụng vị trí hiện tại"}
            </Button>
          </div>

          {/* Coordinates Display */}
          {selectedLocation.lat && selectedLocation.lng && 
           typeof selectedLocation.lat === 'number' && 
           typeof selectedLocation.lng === 'number' && (
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <Label>Vĩ độ (Latitude)</Label>
                <div className="font-mono">{selectedLocation.lat.toFixed(6)}</div>
              </div>
              <div>
                <Label>Kinh độ (Longitude)</Label>
                <div className="font-mono">{selectedLocation.lng.toFixed(6)}</div>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="space-y-2">
            <Label>Chọn vị trí trên bản đồ</Label>
            <div className="h-96 w-full border rounded-lg overflow-hidden">
              <SimpleLeafletMap
                center={{
                  lat: selectedLocation.lat,
                  lng: selectedLocation.lng,
                }}
                points={mapPoints}
                showRoute={false}
                height="100%"
                zoom={15}
                autoFitBounds={false}
                onMapClick={handleMapClick}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Nhấp vào bản đồ để chọn vị trí chính xác cho việc thu gom.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận vị trí</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
