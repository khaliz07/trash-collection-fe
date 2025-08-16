// Reverse geocoding using OpenStreetMap Nominatim API (free)
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi,en`,
      {
        headers: {
          'User-Agent': 'TrashCollection/1.0 (contact@example.com)', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    
    // Build a nice Vietnamese address format
    if (data && data.address) {
      const address = data.address;
      const parts: string[] = [];

      // Add house number and road
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }

      // Add neighborhood/suburb
      if (address.neighbourhood || address.suburb) {
        parts.push(address.neighbourhood || address.suburb);
      }

      // Add ward (commune in Vietnam)
      if (address.commune || address.village) {
        parts.push(address.commune || address.village);
      }

      // Add district
      if (address.city_district || address.county) {
        parts.push(address.city_district || address.county);
      }

      // Add city/province
      if (address.city || address.state) {
        parts.push(address.city || address.state);
      }

      // Add country
      if (address.country) {
        parts.push(address.country);
      }

      return parts.length > 0 ? parts.join(', ') : data.display_name || 'Địa chỉ không xác định';
    }

    return data.display_name || 'Địa chỉ không xác định';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Alternative: Google Maps Reverse Geocoding (requires API key)
export const reverseGeocodeGoogle = async (lat: number, lng: number, apiKey: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=vi`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address from Google Maps');
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    throw new Error('No results found');
  } catch (error) {
    console.error('Google reverse geocoding error:', error);
    return `Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};
