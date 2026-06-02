// lib/location-service.ts
import type { LocationData } from "./agri-types";
import { detectRegionFromCoords, detectRegionFromState, type IndiaRegion } from "./region-logic";

const PINCODE_PATTERN = /^\d{6}$/;

export interface ResolvedLocation {
  lat: number;
  lng: number;
  label: string;
  pincode?: string;
  state?: string;
  district?: string;
  country?: string;
  region: IndiaRegion | string;
}

export const DEFAULT_MAP_CENTER: [number, number] = [20.5, 78.5]; // Center of India
export const DEFAULT_MAP_ZOOM = 5;
export const LOCATION_ZOOM = 13;

// Global Fallback Database (you can expand this)
const GLOBAL_FALLBACK: Record<string, ResolvedLocation> = {
  // --- Existing entries ---
  "523316": { lat: 15.85,   lng: 79.95,   label: "Markapur, Andhra Pradesh",    pincode: "523316", region: "Andhra Pradesh" as IndiaRegion },
  "522001": { lat: 16.3067, lng: 80.4365, label: "Guntur, Andhra Pradesh",       pincode: "522001", region: "Andhra Pradesh" as IndiaRegion },
  "500001": { lat: 17.3850, lng: 78.4867, label: "Hyderabad, Telangana",         pincode: "500001", region: "Telangana"       as IndiaRegion },
  "110001": { lat: 28.6139, lng: 77.2090, label: "New Delhi",                    pincode: "110001", region: "Delhi"           as IndiaRegion },

  // --- Andhra Pradesh additions ---
  "520001": { lat: 16.5062, lng: 80.6480, label: "Vijayawada, Andhra Pradesh",   pincode: "520001", region: "Andhra Pradesh" as IndiaRegion },
  "530001": { lat: 17.6868, lng: 83.2185, label: "Visakhapatnam, Andhra Pradesh",pincode: "530001", region: "Andhra Pradesh" as IndiaRegion },
  "533001": { lat: 17.0005, lng: 81.8040, label: "Rajahmundry, Andhra Pradesh",  pincode: "533001", region: "Andhra Pradesh" as IndiaRegion },
  "516001": { lat: 15.8281, lng: 78.0373, label: "Kurnool, Andhra Pradesh",      pincode: "516001", region: "Andhra Pradesh" as IndiaRegion },
  "515001": { lat: 14.6819, lng: 77.6006, label: "Anantapur, Andhra Pradesh",    pincode: "515001", region: "Andhra Pradesh" as IndiaRegion },
  "517501": { lat: 13.6288, lng: 79.4192, label: "Tirupati, Andhra Pradesh",     pincode: "517501", region: "Andhra Pradesh" as IndiaRegion },
  "524001": { lat: 14.4426, lng: 79.9865, label: "Nellore, Andhra Pradesh",      pincode: "524001", region: "Andhra Pradesh" as IndiaRegion },
  "518001": { lat: 14.4674, lng: 78.8242, label: "Kadapa, Andhra Pradesh",       pincode: "518001", region: "Andhra Pradesh" as IndiaRegion },
  "534201": { lat: 16.7107, lng: 81.0952, label: "Eluru, Andhra Pradesh",        pincode: "534201", region: "Andhra Pradesh" as IndiaRegion },
  "522201": { lat: 16.2430, lng: 80.6383, label: "Tenali, Andhra Pradesh",       pincode: "522201", region: "Andhra Pradesh" as IndiaRegion },
  "523001": { lat: 15.5057, lng: 80.0499, label: "Ongole, Andhra Pradesh",       pincode: "523001", region: "Andhra Pradesh" as IndiaRegion },
  "532001": { lat: 18.2949, lng: 83.8938, label: "Srikakulam, Andhra Pradesh",   pincode: "532001", region: "Andhra Pradesh" as IndiaRegion },
  "535001": { lat: 18.1067, lng: 83.4205, label: "Vizianagaram, Andhra Pradesh", pincode: "535001", region: "Andhra Pradesh" as IndiaRegion },
  "531001": { lat: 17.6910, lng: 83.0037, label: "Anakapalle, Andhra Pradesh",   pincode: "531001", region: "Andhra Pradesh" as IndiaRegion },
  "534001": { lat: 16.5449, lng: 81.5212, label: "Bhimavaram, Andhra Pradesh",   pincode: "534001", region: "Andhra Pradesh" as IndiaRegion },
  "524121": { lat: 14.1500, lng: 79.8500, label: "Gudur, Andhra Pradesh",        pincode: "524121", region: "Andhra Pradesh" as IndiaRegion },
  "516002": { lat: 15.4786, lng: 78.4836, label: "Nandyal, Andhra Pradesh",      pincode: "516002", region: "Andhra Pradesh" as IndiaRegion },
  "533101": { lat: 16.5763, lng: 82.0068, label: "Amalapuram, Andhra Pradesh",   pincode: "533101", region: "Andhra Pradesh" as IndiaRegion },
  "534202": { lat: 16.7900, lng: 80.8500, label: "Nuzvid, Andhra Pradesh",       pincode: "534202", region: "Andhra Pradesh" as IndiaRegion },
};

export async function geocodeWithNominatim(query: string): Promise<ResolvedLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      { 
        headers: { "User-Agent": "AgriVision-FarmerApp/1.0" },
        cache: "no-store"
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (!data?.[0]) return null;

    const item = data[0];
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    return {
      lat,
      lng,
      label: item.display_name.split(",")[0] || query,
      pincode: item.address?.postcode || undefined,
      state: item.address?.state || item.address?.region,
      district: item.address?.county || item.address?.city,
      country: item.address?.country,
      region: detectRegionFromCoords(lat, lng, item.address?.state) || "Global",
    };
  } catch (error) {
    console.error("Nominatim error:", error);
    return null;
  }
}

export async function resolveSearchQuery(query: string): Promise<ResolvedLocation | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  // 1. Check hardcoded fallback (fastest)
  if (PINCODE_PATTERN.test(trimmed) && GLOBAL_FALLBACK[trimmed]) {
    return GLOBAL_FALLBACK[trimmed];
  }

  // 2. Try Indian Postal API for Indian pincodes
  if (PINCODE_PATTERN.test(trimmed)) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${trimmed}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length) {
        const po = data[0].PostOffice[0];
        const addressQuery = `${trimmed}, ${po.Name}, ${po.District}, ${po.State}, India`;
        const geocoded = await geocodeWithNominatim(addressQuery);

        if (geocoded) {
          return {
            ...geocoded,
            label: `${po.Name}, ${po.District}, ${po.State}`,
            pincode: trimmed,
            state: po.State,
            district: po.District,
            country: geocoded.country || "India",
            region: detectRegionFromState(po.State) || geocoded.region,
          };
        }

        return {
          lat: 20.5,
          lng: 78.5,
          label: `${po.Name}, ${po.District}, ${po.State}`,
          pincode: trimmed,
          state: po.State,
          district: po.District,
          country: "India",
          region: detectRegionFromState(po.State),
        };
      }
    } catch (error) {
      console.error("Pincode lookup error:", error);
    }
  }

  // 3. Global Geocoding using Nominatim (works for any country)
  const searchQuery = trimmed.includes(",") ? trimmed : `${trimmed}, world`;
  const result = await geocodeWithNominatim(searchQuery);

  if (result) return result;

  // 4. Final fallback
  return {
    lat: 20.5,
    lng: 78.5,
    label: trimmed,
    region: "Global",
  };
}

export function toLocationData(resolved: ResolvedLocation): LocationData {
  return {
    lat: resolved.lat,
    lng: resolved.lng,
    label: resolved.label,
    pincode: resolved.pincode,
    region: resolved.region as any,
  };
}