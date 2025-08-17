import { NextRequest, NextResponse } from "next/server";

// Cache for provinces data
let provincesCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/address/provinces - Get all provinces
export async function GET() {
  try {
    // Check cache first
    if (provincesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(provincesCache);
    }

    // Try different API endpoints
    const endpoints = [
      'https://provinces.open-api.vn/api/p/',
      'https://vapi.vnappmob.com/api/province/',
      'https://provinces.open-api.vn/api/v1/p/'
    ];

    let provinces = null;
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying provinces API: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TrashCollectionApp/1.0)',
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          provinces = await response.json();
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } else {
          console.log(`Failed with endpoint: ${endpoint}, status: ${response.status}`);
        }
      } catch (error) {
        console.log(`Error with endpoint: ${endpoint}`, error);
        lastError = error;
        continue;
      }
    }

    // If all APIs fail, return fallback data
    if (!provinces) {
      console.log('All province APIs failed, using fallback data');
      provinces = [
        {
          code: '79',
          name: 'Hồ Chí Minh',
          full_name: 'Thành phố Hồ Chí Minh',
          code_name: 'ho_chi_minh'
        },
        {
          code: '01',
          name: 'Hà Nội',
          full_name: 'Thành phố Hà Nội',
          code_name: 'ha_noi'
        },
        {
          code: '48',
          name: 'Đà Nẵng',
          full_name: 'Thành phố Đà Nẵng',
          code_name: 'da_nang'
        },
        {
          code: '04',
          name: 'Cao Bằng',
          full_name: 'Tỉnh Cao Bằng',
          code_name: 'cao_bang'
        },
        {
          code: '06',
          name: 'Bắc Kạn',
          full_name: 'Tỉnh Bắc Kạn',
          code_name: 'bac_kan'
        }
      ];
    }

    // Update cache
    provincesCache = provinces;
    cacheTimestamp = Date.now();

    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Error in provinces API:', error);
    
    // Return fallback data on error
    const fallbackProvinces = [
      {
        code: '79',
        name: 'Hồ Chí Minh',
        full_name: 'Thành phố Hồ Chí Minh',
        code_name: 'ho_chi_minh'
      },
      {
        code: '01',
        name: 'Hà Nội',
        full_name: 'Thành phố Hà Nội',
        code_name: 'ha_noi'
      }
    ];

    return NextResponse.json(fallbackProvinces, { status: 200 });
  }
}
