"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AddressService } from "@/lib/address-service";
import {
  Province,
  District,
  Ward,
  AddressSelection,
  AdministrativeAddress,
} from "@/types/address";
import { Loader2 } from "lucide-react";

interface AddressSelectorProps {
  value?: AddressSelection;
  onChange: (address: AdministrativeAddress) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  required?: boolean;
  showStreetAddress?: boolean;
}

export function AddressSelector({
  value,
  onChange,
  onValidationChange,
  className = "",
  required = false,
  showStreetAddress = true,
}: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>(
    value?.province_code || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    value?.district_code || ""
  );
  const [selectedWard, setSelectedWard] = useState<string>(
    value?.ward_code || ""
  );
  const [streetAddress, setStreetAddress] = useState<string>(
    value?.street_address || ""
  );

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setSelectedWard("");
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  // Validate and notify parent when selection changes
  useEffect(() => {
    validateAndNotify();
  }, [selectedProvince, selectedDistrict, selectedWard, streetAddress]);

  const loadProvinces = async () => {
    setIsLoadingProvinces(true);
    try {
      const data = await AddressService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
      setErrors(["Không thể tải danh sách tỉnh/thành phố"]);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    setIsLoadingDistricts(true);
    try {
      const data = await AddressService.getDistrictsByProvince(provinceCode);
      setDistricts(data);
    } catch (error) {
      console.error("Error loading districts:", error);
      setErrors(["Không thể tải danh sách quận/huyện"]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const loadWards = async (districtCode: string) => {
    setIsLoadingWards(true);
    try {
      const data = await AddressService.getWardsByDistrict(districtCode);
      setWards(data);
    } catch (error) {
      console.error("Error loading wards:", error);
      setErrors(["Không thể tải danh sách phường/xã"]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const validateAndNotify = async () => {
    if (!selectedProvince && !required) {
      // If not required and no province selected, notify with empty address
      onChange({});
      onValidationChange?.(true, []);
      return;
    }

    setIsValidating(true);
    try {
      const validation = await AddressService.validateAddressSelection(
        selectedProvince,
        selectedDistrict,
        selectedWard
      );

      setErrors(validation.errors);
      onValidationChange?.(validation.isValid, validation.errors);

      // Build administrative address object
      const address: AdministrativeAddress = {
        province: validation.province,
        district: validation.district,
        ward: validation.ward,
        street_address: streetAddress.trim() || undefined,
      };

      onChange(address);
    } catch (error) {
      console.error("Error validating address:", error);
      const errorMsg = "Có lỗi xảy ra khi xác thực địa chỉ";
      setErrors([errorMsg]);
      onValidationChange?.(false, [errorMsg]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedWard("");
    setWards([]);
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
  };

  const selectedProvinceData = provinces.find(
    (p) => p.code === selectedProvince
  );
  const selectedDistrictData = districts.find(
    (d) => d.code === selectedDistrict
  );
  const selectedWardData = wards.find((w) => w.code === selectedWard);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Province Selection */}
      <div className="space-y-2">
        <Label htmlFor="province">
          Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={selectedProvince}
          onValueChange={handleProvinceChange}
          disabled={isLoadingProvinces}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {province.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoadingProvinces && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang tải danh sách tỉnh/thành phố...
          </div>
        )}
      </div>

      {/* District Selection */}
      {selectedProvince && (
        <div className="space-y-2">
          <Label htmlFor="district">
            Quận/Huyện {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedDistrict}
            onValueChange={handleDistrictChange}
            disabled={isLoadingDistricts || !selectedProvince}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoadingDistricts ? "Đang tải..." : "Chọn quận/huyện"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingDistricts && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tải danh sách quận/huyện...
            </div>
          )}
        </div>
      )}

      {/* Ward Selection */}
      {selectedDistrict && (
        <div className="space-y-2">
          <Label htmlFor="ward">
            Phường/Xã {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={selectedWard}
            onValueChange={handleWardChange}
            disabled={isLoadingWards || !selectedDistrict}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoadingWards ? "Đang tải..." : "Chọn phường/xã"}
              />
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>
                  {ward.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoadingWards && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tải danh sách phường/xã...
            </div>
          )}
        </div>
      )}

      {/* Street Address */}
      {showStreetAddress && (
        <div className="space-y-2">
          <Label htmlFor="street">Địa chỉ cụ thể</Label>
          <Input
            id="street"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="Số nhà, tên đường..."
          />
        </div>
      )}

      {/* Address Preview */}
      {selectedProvinceData && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium text-gray-700">
            Địa chỉ đầy đủ:
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            {AddressService.formatFullAddress(
              selectedProvinceData,
              selectedDistrictData,
              selectedWardData,
              streetAddress
            )}
          </p>
        </div>
      )}

      {/* Validation Status */}
      {isValidating && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang xác thực địa chỉ...
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
