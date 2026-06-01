import type { LocationData } from "./agri-types"
import { detectRegionFromCoords, detectRegionFromState, type IndiaRegion } from "./region-logic"

const PINCODE_PATTERN = /^\d{6}$/

export interface ResolvedLocation {
  lat: number
  lng: number
  label: string
  pincode?: string
  state?: string
  district?: string
  region: IndiaRegion
}

export function parseCoordinates(input: string): [number, number] | null {
  const match = input.trim().match(/^(-?\d+\.?\d*)\s*[,，]\s*(-?\d+\.?\d*)$/)
  if (!match) return null
  const lat = parseFloat(match[1])
  const lng = parseFloat(match[2])
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng]
  return null
}

async function geocodeWithNominatim(query: string): Promise<ResolvedLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
      { headers: { "User-Agent": "AgriVision-FarmerApp/1.0" } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.[0]) return null
    const lat = parseFloat(data[0].lat)
    const lng = parseFloat(data[0].lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    const label = data[0].display_name as string
    const state = extractStateFromDisplayName(label)
    return {
      lat,
      lng,
      label,
      state,
      region: detectRegionFromCoords(lat, lng, state),
    }
  } catch {
    return null
  }
}

function extractStateFromDisplayName(name: string): string | undefined {
  const parts = name.split(",").map((p) => p.trim())
  for (const p of parts) {
    const lower = p.toLowerCase()
    if (
      lower.includes("telangana") ||
      lower.includes("andhra") ||
      lower.includes("karnataka") ||
      lower.includes("maharashtra") ||
      lower.includes("pradesh") ||
      lower.includes("rajasthan") ||
      lower.includes("punjab") ||
      lower.includes("bihar") ||
      lower.includes("gujarat")
    ) {
      return p
    }
  }
  return parts.length >= 2 ? parts[parts.length - 2] : undefined
}

/** Indian Post API + Nominatim fallback for missing coordinates */
export async function resolvePincode(pincode: string): Promise<ResolvedLocation | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await res.json()
    const block = data?.[0]
    if (block?.Status !== "Success" || !block.PostOffice?.length) {
      return geocodeWithNominatim(`${pincode}, India`)
    }

    const po = block.PostOffice[0]
    const state = po.State as string
    const district = po.District as string
    let lat = parseFloat(po.Latitude)
    let lng = parseFloat(po.Longitude)

    if (Number.isNaN(lat) || Number.isNaN(lng) || (lat === 0 && lng === 0)) {
      const fallback = await geocodeWithNominatim(
        `${po.Name}, ${district}, ${state}, India ${pincode}`
      )
      if (fallback) {
        return { ...fallback, pincode, state, district, region: detectRegionFromState(state) }
      }
      return null
    }

    return {
      lat,
      lng,
      label: `${po.Name}, ${district}, ${state} (PIN ${pincode})`,
      pincode,
      state,
      district,
      region: detectRegionFromCoords(lat, lng, state),
    }
  } catch {
    return geocodeWithNominatim(`${pincode}, India`)
  }
}

export async function resolveSearchQuery(query: string): Promise<ResolvedLocation | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const coords = parseCoordinates(trimmed)
  if (coords) {
    const [lat, lng] = coords
    const rev = await geocodeWithNominatim(`${lat}, ${lng}`)
    return (
      rev ?? {
        lat,
        lng,
        label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        region: detectRegionFromCoords(lat, lng),
      }
    )
  }

  if (PINCODE_PATTERN.test(trimmed)) {
    return resolvePincode(trimmed)
  }

  const withIndia = trimmed.toLowerCase().includes("india")
    ? trimmed
    : `${trimmed}, India`
  return geocodeWithNominatim(withIndia)
}

export function toLocationData(resolved: ResolvedLocation): LocationData {
  return {
    lat: resolved.lat,
    lng: resolved.lng,
    label: resolved.label,
    pincode: resolved.pincode,
    state: resolved.state,
    district: resolved.district,
    region: resolved.region,
  }
}

/** Default map centre: Telangana (Hyderabad region) */
export const DEFAULT_MAP_CENTER: [number, number] = [17.385, 78.4867]
export const DEFAULT_MAP_ZOOM = 7
export const LOCATION_ZOOM = 13
