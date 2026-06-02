export interface MandiPrice {
  mandi: string
  crop: string
  pricePerQuintal: number
  distanceKm: number
  trend: "up" | "down" | "stable"
  bestSellNote: string
}

interface RegionMandi {
  mandi: string
  basePrice: number
  distance: number
  trend: "up" | "down" | "stable"
}

const REGION_MANDIS: Record<string, RegionMandi[]> = {
  telangana: [
    { mandi: "Hyderabad Wholesale Market", basePrice: 2200, distance: 40, trend: "stable" },
    { mandi: "Guntur Market Yard", basePrice: 2250, distance: 80, trend: "up" },
    { mandi: "Vijayawada APMC", basePrice: 2180, distance: 110, trend: "down" },
  ],
  ap: [
    { mandi: "Vijayawada APMC", basePrice: 2150, distance: 90, trend: "up" },
    { mandi: "Guntur Market Yard", basePrice: 2200, distance: 130, trend: "stable" },
    { mandi: "Tirupati Market", basePrice: 2120, distance: 180, trend: "down" },
  ],
  north: [
    { mandi: "Ludhiana Grain Market", basePrice: 2300, distance: 120, trend: "up" },
    { mandi: "Karnal APMC", basePrice: 2280, distance: 150, trend: "stable" },
    { mandi: "Ambala Grain Centre", basePrice: 2250, distance: 170, trend: "down" },
  ],
  delhi: [
    { mandi: "Azadpur (Delhi)", basePrice: 2320, distance: 30, trend: "up" },
    { mandi: "Narela APMC", basePrice: 2270, distance: 55, trend: "stable" },
    { mandi: "Faridabad Market", basePrice: 2250, distance: 85, trend: "down" },
  ],
  west: [
    { mandi: "Nashik APMC", basePrice: 2180, distance: 95, trend: "up" },
    { mandi: "Indore Krishi Upaj", basePrice: 2150, distance: 140, trend: "stable" },
    { mandi: "Ahmedabad Mandis", basePrice: 2120, distance: 185, trend: "down" },
  ],
  generic: [
    { mandi: "Azadpur (Delhi)", basePrice: 2160, distance: 180, trend: "up" },
    { mandi: "Nashik APMC", basePrice: 2180, distance: 195, trend: "down" },
    { mandi: "Indore Krishi Upaj", basePrice: 2200, distance: 165, trend: "stable" },
  ],
}

const cropPremium = (cropName: string) => {
  const value = cropName.toLowerCase()
  if (value.includes("rice")) return 320
  if (value.includes("wheat")) return 280
  if (value.includes("cotton")) return 190
  if (value.includes("maize") || value.includes("corn")) return 230
  if (value.includes("sugarcane")) return 260
  return 200
}

const regionFromPincode = (pincode?: string): string => {
  if (!pincode) return "generic"
  const prefix = Number(pincode.slice(0, 2))
  if ([50, 51, 52, 53].includes(prefix)) return "telangana"
  if ([11].includes(prefix)) return "delhi"
  if ([12, 13, 14, 15, 16, 17, 18, 19].includes(prefix)) return "north"
  if ([38, 39].includes(prefix)) return "west"
  if ([40, 41, 42, 43, 44, 45, 46, 47, 48, 49].includes(prefix)) return "west"
  if ([56, 57, 58, 59].includes(prefix)) return "generic"
  return "generic"
}

export function getNearbyMandiPrices(
  cropName: string,
  location: { lat: number; lng: number; pincode?: string }
): MandiPrice[] {
  const regionKey = regionFromPincode(location.pincode)
  const mandis = REGION_MANDIS[regionKey] ?? REGION_MANDIS.generic
  const premium = cropPremium(cropName)
  const seed = Math.abs(Math.floor(location.lat * 100 + location.lng * 10)) % 60

  return mandis.map((m, index) => ({
    mandi: m.mandi,
    crop: cropName,
    pricePerQuintal: m.basePrice + premium + (index * 40) + seed,
    distanceKm: Math.min(m.distance + index * 12, 200),
    trend: m.trend,
    bestSellNote:
      index === 0
        ? "Local mandi with fresh arrivals. Best to check early morning."
        : "Verify daily market arrivals and transport cost before selling.",
  }))
}
