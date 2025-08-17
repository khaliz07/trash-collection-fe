/**
 * Address service for Vietnamese administrative divisions
 * Uses local API proxy to avoid CORS issues
 */

import { Province, District, Ward } from "@/types/address";

// Local API proxy endpoints
const PROVINCES_API = "/api/address/provinces";
const DISTRICTS_API = "/api/address/districts/";
const WARDS_API = "/api/address/wards/";

// Cache for API responses to avoid repeated requests
const cache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getCachedData(key: string): any | null {
  const entry = cache.get(key) as CacheEntry;
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export class AddressService {
  /**
   * Fetch all provinces in Vietnam
   */
  static async getProvinces(): Promise<Province[]> {
    const cacheKey = "provinces";
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch("/api/address/provinces");
      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }

      const rawProvinces = await response.json();

      // Transform data to match our interface
      const provinces: Province[] = rawProvinces.map((p: any) => ({
        code: String(p.code), // Convert to string for consistency
        name: p.name,
        full_name: p.name, // Use name as full_name if not provided
        code_name: p.codename || p.code_name || "",
        division_type: p.division_type || "",
        phone_code: p.phone_code || 0,
      }));

      setCachedData(cacheKey, provinces);
      return provinces;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      // Fallback data in case API fails
      return [
        {
          code: "79",
          name: "Thành phố Hồ Chí Minh",
          full_name: "Thành phố Hồ Chí Minh",
          code_name: "thanh_pho_ho_chi_minh",
        },
        {
          code: "1",
          name: "Thành phố Hà Nội",
          full_name: "Thành phố Hà Nội",
          code_name: "thanh_pho_ha_noi",
        },
      ];
    }
  }
  /**
   * Fetch districts by province code
   */
  static async getDistrictsByProvince(
    provinceCode: string
  ): Promise<District[]> {
    if (!provinceCode) return [];

    const cacheKey = `districts_${provinceCode}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/address/districts/${provinceCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }

      const districts: District[] = await response.json();
      setCachedData(cacheKey, districts);
      return districts;
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  }

  /**
   * Fetch wards by district code
   */
  static async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    if (!districtCode) return [];

    const cacheKey = `wards_${districtCode}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/address/wards/${districtCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch wards");
      }

      const wards: Ward[] = await response.json();
      setCachedData(cacheKey, wards);
      return wards;
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  }

  /**
   * Get province by code
   */
  static async getProvinceByCode(code: string): Promise<Province | null> {
    const provinces = await this.getProvinces();
    return provinces.find((p) => p.code === code) || null;
  }

  /**
   * Get district by code
   */
  static async getDistrictByCode(
    code: string,
    provinceCode: string
  ): Promise<District | null> {
    const districts = await this.getDistrictsByProvince(provinceCode);
    return districts.find((d) => d.code === code) || null;
  }

  /**
   * Get ward by code
   */
  static async getWardByCode(
    code: string,
    districtCode: string
  ): Promise<Ward | null> {
    const wards = await this.getWardsByDistrict(districtCode);
    return wards.find((w) => w.code === code) || null;
  }

  /**
   * Validate address selection
   */
  static async validateAddressSelection(
    provinceCode?: string,
    districtCode?: string,
    wardCode?: string
  ): Promise<{
    isValid: boolean;
    errors: string[];
    province?: Province;
    district?: District;
    ward?: Ward;
  }> {
    const errors: string[] = [];
    let province: Province | null = null;
    let district: District | null = null;
    let ward: Ward | null = null;

    // Validate province
    if (provinceCode) {
      province = await this.getProvinceByCode(provinceCode);
      if (!province) {
        errors.push("Tỉnh/thành phố không hợp lệ");
      }
    }

    // Validate district
    if (districtCode && province) {
      district = await this.getDistrictByCode(districtCode, provinceCode!);
      if (!district) {
        errors.push("Quận/huyện không hợp lệ");
      } else if (district.province_code !== provinceCode) {
        errors.push("Quận/huyện không thuộc tỉnh/thành phố đã chọn");
      }
    }

    // Validate ward
    if (wardCode && district) {
      ward = await this.getWardByCode(wardCode, districtCode!);
      if (!ward) {
        errors.push("Phường/xã không hợp lệ");
      } else if (ward.district_code !== districtCode) {
        errors.push("Phường/xã không thuộc quận/huyện đã chọn");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      province: province || undefined,
      district: district || undefined,
      ward: ward || undefined,
    };
  }

  /**
   * Format full address string
   */
  static formatFullAddress(
    province?: Province,
    district?: District,
    ward?: Ward,
    streetAddress?: string
  ): string {
    const parts = [];

    if (streetAddress?.trim()) {
      parts.push(streetAddress.trim());
    }
    if (ward) {
      parts.push(ward.full_name);
    }
    if (district) {
      parts.push(district.full_name);
    }
    if (province) {
      parts.push(province.full_name);
    }

    return parts.join(", ");
  }

  /**
   * Format short address for display in tables/cards
   */
  static formatShortAddress(
    province?: Province,
    district?: District,
    ward?: Ward
  ): { main: string; sub: string } {
    const main = district?.name || "—";
    const sub = province?.name || "—";
    
    return { main, sub };
  }
}
