import { NextRequest, NextResponse } from "next/server";

// Cache for wards data by district
const wardsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const entry = wardsCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  wardsCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  wardsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Simple fallback data for rare edge cases
const FALLBACK_WARDS: Record<string, any[]> = {
  // Only keep minimal fallback for critical districts
};

// GET /api/address/wards/[districtCode] - Get wards by district
export async function GET(
  request: NextRequest,
  { params }: { params: { districtCode: string } }
) {
  const districtCode = params.districtCode;
  const cacheKey = `wards_${districtCode}`;

  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Try the correct API endpoint
    const endpoint = `https://provinces.open-api.vn/api/v1/d/${districtCode}?depth=2`;

    try {
      console.log(`Trying wards API: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TrashCollectionApp/1.0)",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract wards from the district data
        const wards = data.wards || [];

        // Transform data to match our interface
        const transformedWards = wards.map((ward: any) => ({
          code: ward.code.toString(),
          name: ward.name,
          full_name: ward.name,
          code_name: ward.codename,
          district_code: districtCode,
          province_code: data.province_code?.toString(),
        }));

        console.log(
          `Success with endpoint: ${endpoint}, found ${transformedWards.length} wards`
        );

        // Update cache
        setCachedData(cacheKey, transformedWards);

        return NextResponse.json(transformedWards);
      } else {
        console.log(
          `Failed with endpoint: ${endpoint}, status: ${response.status}`
        );
      }
    } catch (error) {
      console.log(`Error with endpoint: ${endpoint}`, error);
    }

    // If API fails, use fallback data
    console.log(
      `Ward API failed for district ${districtCode}, using fallback data`
    );
    const fallbackWards = FALLBACK_WARDS[districtCode] || [];

    // Update cache with fallback
    setCachedData(cacheKey, fallbackWards);

    return NextResponse.json(fallbackWards);
  } catch (error) {
    console.error("Error in wards API:", error);

    // Return fallback data on error
    const fallbackWards = FALLBACK_WARDS[districtCode] || [];
    return NextResponse.json(fallbackWards, { status: 200 });
  }
}
