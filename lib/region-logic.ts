/** Agro-climatic zones for Indian crop recommendation weighting */
export type IndiaRegion =
  | "telangana"
  | "andhra_pradesh"
  | "deccan_south"
  | "north_india"
  | "west_india"
  | "east_india"
  | "all_india"

const TG_BOUNDS = { latMin: 15.8, latMax: 19.9, lngMin: 77.2, lngMax: 81.5 }
const AP_BOUNDS = { latMin: 12.4, latMax: 19.1, lngMin: 76.7, lngMax: 84.8 }

export function detectRegionFromCoords(
  lat: number,
  lng: number,
  state?: string
): IndiaRegion {
  if (state) return detectRegionFromState(state)

  if (
    lat >= TG_BOUNDS.latMin &&
    lat <= TG_BOUNDS.latMax &&
    lng >= TG_BOUNDS.lngMin &&
    lng <= TG_BOUNDS.lngMax
  ) {
    return "telangana"
  }
  if (
    lat >= AP_BOUNDS.latMin &&
    lat <= AP_BOUNDS.latMax &&
    lng >= AP_BOUNDS.lngMin &&
    lng <= AP_BOUNDS.lngMax &&
    !(lat >= TG_BOUNDS.latMin && lat <= TG_BOUNDS.latMax && lng >= TG_BOUNDS.lngMin && lng <= TG_BOUNDS.lngMax)
  ) {
    return "andhra_pradesh"
  }
  if (lat < 20 && lng > 74 && lng < 80) return "deccan_south"
  if (lat > 26) return "north_india"
  if (lng < 74) return "west_india"
  if (lng > 85) return "east_india"
  return "all_india"
}

export function detectRegionFromState(state: string): IndiaRegion {
  const s = state.toLowerCase()
  if (s.includes("telangana")) return "telangana"
  if (s.includes("andhra")) return "andhra_pradesh"
  if (
    s.includes("karnataka") ||
    s.includes("tamil") ||
    s.includes("kerala") ||
    s.includes("puducherry")
  ) {
    return "deccan_south"
  }
  if (
    s.includes("punjab") ||
    s.includes("haryana") ||
    s.includes("uttar") ||
    s.includes("delhi") ||
    s.includes("himachal") ||
    s.includes("rajasthan")
  ) {
    return "north_india"
  }
  if (s.includes("maharashtra") || s.includes("gujarat") || s.includes("goa")) {
    return "west_india"
  }
  if (
    s.includes("bihar") ||
    s.includes("west bengal") ||
    s.includes("odisha") ||
    s.includes("assam")
  ) {
    return "east_india"
  }
  return "all_india"
}

/** Extra suitability points for regional staple crops */
export const REGION_CROP_BONUS: Record<IndiaRegion, string[]> = {
  telangana: ["rice", "cotton", "maize", "chilli", "turmeric", "groundnut", "soybean"],
  andhra_pradesh: ["rice", "cotton", "chilli", "sugarcane", "groundnut", "maize", "tobacco"],
  deccan_south: ["rice", "sugarcane", "cotton", "groundnut", "maize"],
  north_india: ["wheat", "rice", "mustard", "potato", "sugarcane"],
  west_india: ["cotton", "groundnut", "soybean", "wheat", "chickpea"],
  east_india: ["rice", "potato", "mustard", "jute"],
  all_india: [],
}

export function getRegionLabel(region: IndiaRegion): string {
  const labels: Record<IndiaRegion, string> = {
    telangana: "Telangana",
    andhra_pradesh: "Andhra Pradesh",
    deccan_south: "South India",
    north_india: "North India",
    west_india: "West India",
    east_india: "East India",
    all_india: "All India",
  }
  return labels[region]
}
