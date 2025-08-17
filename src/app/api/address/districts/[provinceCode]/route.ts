import { NextRequest, NextResponse } from "next/server";

// Cache for districts data by province
const districtsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const entry = districtsCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }
  districtsCache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  districtsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Simple fallback data for rare edge cases
const FALLBACK_DISTRICTS: Record<string, any[]> = {
  // Only keep minimal fallback for critical provinces
};

// GET /api/address/districts/[provinceCode] - Get districts by province
export async function GET(
  request: NextRequest,
  { params }: { params: { provinceCode: string } }
) {
  const provinceCode = params.provinceCode;
  const cacheKey = `districts_${provinceCode}`;

  try {
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Try the correct API endpoint
    const endpoint = `https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`;

    try {
      console.log(`Trying districts API: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TrashCollectionApp/1.0)',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract districts from the province data
        const districts = data.districts || [];
        
        // Transform data to match our interface
        const transformedDistricts = districts.map((district: any) => ({
          code: district.code.toString(),
          name: district.name,
          full_name: district.name,
          code_name: district.codename,
          province_code: provinceCode
        }));

        console.log(`Success with endpoint: ${endpoint}, found ${transformedDistricts.length} districts`);
        
        // Update cache
        setCachedData(cacheKey, transformedDistricts);
        
        return NextResponse.json(transformedDistricts);
      } else {
        console.log(`Failed with endpoint: ${endpoint}, status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Error with endpoint: ${endpoint}`, error);
    }

    // If API fails, use fallback data
    console.log(`District API failed for province ${provinceCode}, using fallback data`);
    const fallbackDistricts = FALLBACK_DISTRICTS[provinceCode] || [];
    
    // Update cache with fallback
    setCachedData(cacheKey, fallbackDistricts);

    return NextResponse.json(fallbackDistricts);
  } catch (error) {
    console.error('Error in districts API:', error);
    
    // Return fallback data on error
    const fallbackDistricts = FALLBACK_DISTRICTS[provinceCode] || [];
    return NextResponse.json(fallbackDistricts, { status: 200 });
  }
}
