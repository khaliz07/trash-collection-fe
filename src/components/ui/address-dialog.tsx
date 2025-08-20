"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressSelector } from "@/components/ui/address-selector";
import { AdministrativeAddress } from "@/types/address";
import { AddressService } from "@/lib/address-service";
import leafletService, { type LatLng } from "@/lib/leaflet-service";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Dynamic import to prevent SSR issues
const SimpleLeafletMap = dynamic(
  () => import("@/components/ui/simple-leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  }
);

interface AddressDialogProps {
  value?: string;
  onChange?: (address: string) => void;
  trigger?: React.ReactNode;
}

interface SelectedLocation {
  administrativeAddress: AdministrativeAddress;
  coordinates: LatLng;
  detailAddress: string;
}

export function AddressDialog({
  value,
  onChange,
  trigger,
}: AddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    administrativeAddress: {},
    coordinates: leafletService.getDefaultCenter(),
    detailAddress: "",
  });
  const [mapCenter, setMapCenter] = useState<LatLng>(
    leafletService.getDefaultCenter()
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapPoints, setMapPoints] = useState<
    Array<{
      id: string;
      lat: number;
      lng: number;
      address: string;
      type: "pickup";
    }>
  >([]);

  // Initialize with current value
  useEffect(() => {
    if (value && value.trim()) {
      setSelectedLocation((prev) => ({
        ...prev,
        detailAddress: value,
      }));
    }
  }, [value]);

  // Handle administrative address change
  const handleAdministrativeAddressChange = async (
    address: AdministrativeAddress
  ) => {
    setSelectedLocation((prev) => ({
      ...prev,
      administrativeAddress: address,
    }));

    // Focus map on selected administrative area
    try {
      const fullAddress = AddressService.formatFullAddress(
        address.province,
        address.district,
        address.ward
      );

      if (fullAddress) {
        const coordinates = await leafletService.geocodeAddress(fullAddress);
        setMapCenter(coordinates);
        setSelectedLocation((prev) => ({
          ...prev,
          coordinates,
        }));
      }
    } catch (error) {
      console.warn("Could not focus map on administrative area:", error);
    }
  };

  // Handle map click to set location
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Get address from coordinates
      const address = await leafletService.reverseGeocode(lat, lng);

      // Set map point
      setMapPoints([
        {
          id: "selected-location",
          lat,
          lng,
          address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          type: "pickup",
        },
      ]);

      // Update coordinates
      setSelectedLocation((prev) => ({
        ...prev,
        coordinates: { lat, lng },
      }));
    } catch (error) {
      console.error("Error handling map click:", error);
      toast.error("Không thể lấy thông tin địa chỉ");
    }
  };

  // Parse address string to extract administrative components
  const parseAddressComponents = async (fullAddress: string) => {
    try {
      // Get all provinces, districts, and wards for matching
      const provinces = await AddressService.getProvinces();

      // Try to match province
      let matchedProvince = null;
      for (const province of provinces) {
        if (
          (province.full_name && fullAddress.includes(province.full_name)) ||
          (province.name && fullAddress.includes(province.name))
        ) {
          matchedProvince = province;
          break;
        }
      }

      if (!matchedProvince) {
        console.warn("Could not match province from address:", fullAddress);
        return null;
      }

      // Try to match district
      let matchedDistrict = null;
      const districts = await AddressService.getDistrictsByProvince(
        matchedProvince.code
      );
      for (const district of districts) {
        if (
          (district.full_name && fullAddress.includes(district.full_name)) ||
          (district.name && fullAddress.includes(district.name))
        ) {
          matchedDistrict = district;
          break;
        }
      }

      if (!matchedDistrict) {
        console.warn("Could not match district from address:", fullAddress);
        return { province: matchedProvince };
      }

      // Try to match ward
      let matchedWard = null;
      const wards = await AddressService.getWardsByDistrict(
        matchedDistrict.code
      );
      for (const ward of wards) {
        if (
          (ward.full_name && fullAddress.includes(ward.full_name)) ||
          (ward.name && fullAddress.includes(ward.name))
        ) {
          matchedWard = ward;
          break;
        }
      }

      // Extract detail address (parts not included in administrative divisions)
      let detailAddress = fullAddress;

      // Remove administrative parts from detail address
      if (matchedWard && matchedWard.full_name) {
        detailAddress = detailAddress.replace(matchedWard.full_name, "");
        if (matchedWard.name) {
          detailAddress = detailAddress.replace(matchedWard.name, "");
        }
      }
      if (matchedDistrict && matchedDistrict.full_name) {
        detailAddress = detailAddress.replace(matchedDistrict.full_name, "");
        if (matchedDistrict.name) {
          detailAddress = detailAddress.replace(matchedDistrict.name, "");
        }
      }
      if (matchedProvince && matchedProvince.full_name) {
        detailAddress = detailAddress.replace(matchedProvince.full_name, "");
        if (matchedProvince.name) {
          detailAddress = detailAddress.replace(matchedProvince.name, "");
        }
      }

      // Clean up detail address
      detailAddress = detailAddress
        .replace(/,\s*,/g, ",") // Remove double commas
        .replace(/^,\s*/, "") // Remove leading comma
        .replace(/,\s*$/, "") // Remove trailing comma
        .trim();

      return {
        province: matchedProvince,
        district: matchedDistrict || undefined,
        ward: matchedWard || undefined,
        detailAddress: detailAddress || "",
      };
    } catch (error) {
      console.error("Error parsing address components:", error);
      return null;
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Update map center and coordinates
          const coordinates = { lat: latitude, lng: longitude };
          setMapCenter(coordinates);

          // Get full address from coordinates
          const fullAddress = await leafletService.reverseGeocode(
            latitude,
            longitude
          );

          // Set map point
          setMapPoints([
            {
              id: "current-location",
              lat: latitude,
              lng: longitude,
              address:
                fullAddress ||
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              type: "pickup",
            },
          ]);

          // Parse address to get administrative components and detail address
          if (fullAddress) {
            const parsedAddress = await parseAddressComponents(fullAddress);

            if (parsedAddress) {
              // Update administrative address
              const administrativeAddress = {
                province: parsedAddress.province,
                district: parsedAddress.district,
                ward: parsedAddress.ward,
              };

              setSelectedLocation((prev) => ({
                ...prev,
                coordinates,
                administrativeAddress,
                detailAddress: parsedAddress.detailAddress || "",
              }));

              toast.success("Đã lấy vị trí hiện tại và cập nhật địa chỉ");
            } else {
              // Fallback if parsing fails
              setSelectedLocation((prev) => ({
                ...prev,
                coordinates,
                detailAddress: fullAddress,
              }));

              toast.success(
                "Đã lấy vị trí hiện tại (không thể phân tích địa chỉ hành chính)"
              );
            }
          } else {
            // Fallback if reverse geocoding fails
            setSelectedLocation((prev) => ({
              ...prev,
              coordinates,
            }));

            toast.success("Đã lấy vị trí hiện tại");
          }
        } catch (error) {
          console.error("Error getting location details:", error);
          toast.error("Không thể lấy thông tin địa chỉ");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Không thể lấy vị trí hiện tại";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Bạn đã từ chối quyền truy cập vị trí";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Thông tin vị trí không khả dụng";
            break;
          case error.TIMEOUT:
            message = "Hết thời gian chờ lấy vị trí";
            break;
        }

        toast.error(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Handle save
  const handleSave = () => {
    // Build full address string
    let fullAddress = "";

    if (selectedLocation.detailAddress.trim()) {
      fullAddress = selectedLocation.detailAddress.trim();
    }

    // Add administrative address if available
    const administrativeAddr = AddressService.formatFullAddress(
      selectedLocation.administrativeAddress.province,
      selectedLocation.administrativeAddress.district,
      selectedLocation.administrativeAddress.ward
    );

    if (administrativeAddr) {
      if (fullAddress && !fullAddress.includes(administrativeAddr)) {
        fullAddress += `, ${administrativeAddr}`;
      } else if (!fullAddress) {
        fullAddress = administrativeAddr;
      }
    }

    if (!fullAddress.trim()) {
      toast.error(
        "Vui lòng nhập địa chỉ chi tiết hoặc chọn vị trí trên bản đồ"
      );
      return;
    }

    onChange?.(fullAddress);
    setIsOpen(false);
    toast.success("Đã cập nhật địa chỉ");
  };

  // Handle cancel
  const handleCancel = () => {
    setIsOpen(false);
    // Reset to initial state
    setSelectedLocation({
      administrativeAddress: {},
      coordinates: leafletService.getDefaultCenter(),
      detailAddress: value || "",
    });
    setMapPoints([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="mr-2 h-4 w-4" />
            {value ? "Thay đổi địa chỉ" : "Chọn địa chỉ"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Administrative Address Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Địa chỉ hành chính</Label>
            <AddressSelector
              value={{
                province_code:
                  selectedLocation.administrativeAddress.province?.code,
                district_code:
                  selectedLocation.administrativeAddress.district?.code,
                ward_code: selectedLocation.administrativeAddress.ward?.code,
                street_address: undefined,
              }}
              onChange={handleAdministrativeAddressChange}
              required={false}
              showStreetAddress={false}
              className="bg-gray-50 p-4 rounded-lg border"
            />
          </div>

          {/* Map Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">
                Chọn vị trí trên bản đồ
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center gap-2"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isGettingLocation
                  ? "Đang lấy vị trí..."
                  : "Lấy vị trí hiện tại"}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <SimpleLeafletMap
                center={mapCenter}
                points={mapPoints}
                showRoute={false}
                autoFitBounds={false}
                onMapClick={handleMapClick}
                height="300px"
                zoom={13}
              />
            </div>

            {mapPoints.length > 0 && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <div className="font-medium">Vị trí đã chọn:</div>
                <div>{mapPoints[0].address}</div>
                <div className="text-xs">
                  {mapPoints[0].lat.toFixed(6)}, {mapPoints[0].lng.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Detail Address Input */}
          <div className="space-y-3">
            <Label htmlFor="detail-address" className="text-base font-medium">
              Địa chỉ chi tiết
            </Label>
            <Input
              id="detail-address"
              placeholder="Nhập số nhà, tên đường cụ thể..."
              value={selectedLocation.detailAddress}
              onChange={(e) =>
                setSelectedLocation((prev) => ({
                  ...prev,
                  detailAddress: e.target.value,
                }))
              }
              className="w-full"
            />
            <p className="text-sm text-gray-600">
              Nhập thông tin chi tiết như số nhà, tên đường để hoàn thiện địa
              chỉ
            </p>
          </div>

          {/* Preview */}
          {(selectedLocation.detailAddress.trim() ||
            selectedLocation.administrativeAddress.province) && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Xem trước địa chỉ</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="font-medium">
                  {[
                    selectedLocation.detailAddress.trim(),
                    AddressService.formatFullAddress(
                      selectedLocation.administrativeAddress.province,
                      selectedLocation.administrativeAddress.district,
                      selectedLocation.administrativeAddress.ward
                    ),
                  ]
                    .filter(Boolean)
                    .join(", ") || "Chưa có thông tin địa chỉ"}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Xác nhận địa chỉ</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
