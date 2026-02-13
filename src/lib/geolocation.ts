/**
 * Geolocation utilities for finding user's representatives
 */

export interface GeoLocation {
  state: string; // State abbreviation
  stateName: string; // Full state name
  city?: string;
  country: string;
}

const STATE_NAME_TO_ABBREV: Record<string, string> = {
  "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
  "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
  "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
  "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
  "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
  "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
  "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
  "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
  "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
  "wisconsin": "WI", "wyoming": "WY", 
  "district of columbia": "DC", "washington dc": "DC", "washington, dc": "DC",
};

/**
 * Get user's location using ipapi.co (free tier)
 * Falls back gracefully if API is unavailable
 */
export async function getUserLocation(): Promise<GeoLocation | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }
    
    const data = await response.json();
    
    // Validate we got US location
    if (data.country_code !== 'US') {
      console.warn('User location is not in the US');
      return null;
    }
    
    const stateLower = data.region?.toLowerCase() || '';
    const stateAbbrev = STATE_NAME_TO_ABBREV[stateLower] || data.region_code || '';
    
    return {
      state: stateAbbrev.toUpperCase(),
      stateName: data.region || '',
      city: data.city,
      country: data.country_name,
    };
  } catch (error) {
    console.error('Error fetching geolocation:', error);
    return null;
  }
}

/**
 * Store user's preferred state in localStorage
 */
export function saveUserState(stateAbbrev: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('userState', stateAbbrev);
  } catch (error) {
    console.error('Error saving state preference:', error);
  }
}

/**
 * Get user's preferred state from localStorage
 */
export function getUserState(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('userState');
  } catch (error) {
    console.error('Error reading state preference:', error);
    return null;
  }
}

/**
 * Clear user's state preference
 */
export function clearUserState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('userState');
  } catch (error) {
    console.error('Error clearing state preference:', error);
  }
}
