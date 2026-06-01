export interface MandiPrice {
  mandi: string
  crop: string
  pricePerQuintal: number
  distanceKm: number
  trend: "up" | "down" | "stable"
  bestSellNote: string
}

export function getNearbyMandiPrices(cropName: string, lat: number, lng: number): MandiPrice[] {
  const base = cropName.split(" ")[0]
  const seed = Math.abs(Math.floor(lat * 100 + lng * 10)) % 500

  const mandis = [
    { mandi: "Azadpur (Delhi)", offset: 0 },
    { mandi: "Nashik APMC", offset: 120 },
    { mandi: "Indore Krishi Upaj", offset: 85 },
    { mandi: "Kota Mandi", offset: 200 },
    { mandi: "Ludhiana Grain Market", offset: 150 },
  ]

  return mandis.map((m, i) => ({
    mandi: m.mandi,
    crop: base,
    pricePerQuintal: 1800 + seed + i * 120 + (base === "Rice" ? 400 : 0),
    distanceKm: Math.min(30 + m.offset + (seed % 80), 200),
    trend: (["up", "down", "stable"] as const)[i % 3],
    bestSellNote:
      i === 0
        ? "Morning auction 6–9 AM — highest competition"
        : "Mid-week arrivals often fetch better rates",
  }))
}
