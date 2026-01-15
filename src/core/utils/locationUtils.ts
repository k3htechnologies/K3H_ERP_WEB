/**
 * Get current location using browser geolocation API
 * @returns Promise with latitude, longitude, and formatted address
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: false, // Faster, less accurate but sufficient for punch in/out
      timeout: 8000, // Reduced from 20s to 8s for faster response
      maximumAge: 60000 // Allow cached location up to 1 minute old for faster response
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const timestamp = new Date().toISOString();

        try {
          const address = await getAddressFromCoordinates(latitude, longitude);
          
          resolve({
            latitude,
            longitude,
            address,
            timestamp
          });
        } catch {
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp
          });
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Add timeout to prevent blocking for too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for address fetch

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'K3H-ERP-Web-App',
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('No address data found');
    }

    const addr = data.address;
    const parts: string[] = [];
    
    // Build address in a logical order: street -> area -> city -> state -> country
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road || addr.street || addr.pedestrian) {
      const street = addr.road || addr.street || addr.pedestrian;
      if (addr.house_number) {
        parts.push(street);
      } else {
        parts.push(street);
      }
    }
    
    if (addr.suburb || addr.neighbourhood || addr.quarter) {
      parts.push(addr.suburb || addr.neighbourhood || addr.quarter);
    }
    
    if (addr.city || addr.town || addr.village || addr.municipality) {
      parts.push(addr.city || addr.town || addr.village || addr.municipality);
    }
    
    if (addr.state_district && addr.state_district !== (addr.city || addr.town || addr.village)) {
      parts.push(addr.state_district);
    }
    
    if (addr.state || addr.region) {
      parts.push(addr.state || addr.region);
    }
    
    if (addr.postcode) {
      parts.push(addr.postcode);
    }
    
    if (addr.country) {
      parts.push(addr.country);
    }

    // If we have a good address, return it; otherwise try display_name
    if (parts.length > 0) {
      const formattedAddress = parts.join(', ');
      // Make sure we're not just returning coordinates
      if (!formattedAddress.includes(latitude.toFixed(2)) && !formattedAddress.includes(longitude.toFixed(2))) {
        return formattedAddress;
      }
    }
    
    // Fallback to display_name if available
    if (data.display_name && data.display_name !== `${latitude}, ${longitude}`) {
      return data.display_name;
    }

    // Last resort: return coordinates
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error: any) {
    // If timeout or other error, return coordinates (non-blocking)
    if (error.name === 'AbortError') {
      console.warn('Address fetch timeout, using coordinates');
    } else {
      console.error('Error getting address from coordinates:', error);
    }
    // If reverse geocoding fails, return coordinates
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

export const formatLocationString = (location: LocationData): string => {
  // Check if address is valid (not just coordinates)
  const isCoordinateOnly = location.address === `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` ||
    location.address === `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` ||
    /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(location.address.trim());
  
  if (location.address && !isCoordinateOnly) {
    // Return address with coordinates in parentheses
    return `${location.address} (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`;
  }
  
  // If only coordinates, return them
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};



