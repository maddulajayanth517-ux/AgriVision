import type { IndiaRegion } from "./region-logic"

export interface LocationData {
  lat: number
  lng: number
  label: string
  pincode?: string
  state?: string
  district?: string
  region?: IndiaRegion
}

export type IndianSeason =
  | "kharif"
  | "rabi"
  | "zaid"
  | "summer"
  | "winter"
  | "all"

export type WaterNeeds = "low" | "medium" | "high"

export interface FertilizerLimit {
  name: string
  safePerAcre: string
  maxLimit: string
  warning: string
}

export interface PesticideGuidance {
  name: string
  safeUse: string
  maxLimit: string
  warning: string
}

export interface CropProfile {
  id: string
  name: string
  nameHi?: string
  seasons: IndianSeason[]
  waterNeeds: WaterNeeds
  waterLitersPerDayPerAcre: { min: number; max: number }
  temperatureRange: string
  soilType: string
  harvestTime: string
  description: string
  tips: string[]
  sustainabilityNotes: string[]
  seedBrands: string[]
  pesticideBrands: string[]
  pesticides?: PesticideGuidance[]
  fertilizers: FertilizerLimit[]
  mandiHint: string
  bestSellWindow: string
  /** States/regions where this crop is a major staple */
  popularIn?: string[]
}

export interface ClimateData {
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  soilMoisture: number
  uvIndex: number
  climate: string
}

export interface CropRecommendation extends CropProfile {
  suitability: number
  seasonMatch: number
  selected?: boolean
}

export const INDIAN_SEASONS: {
  id: IndianSeason
  label: string
  months: string
  description: string
}[] = [
  {
    id: "kharif",
    label: "Kharif (Monsoon)",
    months: "Jun – Oct",
    description: "Monsoon sowing — rice, cotton, maize, soybean",
  },
  {
    id: "rabi",
    label: "Rabi (Winter)",
    months: "Oct – Mar",
    description: "Winter crop — wheat, mustard, chickpea, potato",
  },
  {
    id: "zaid",
    label: "Zaid (Summer gap)",
    months: "Mar – Jun",
    description: "Short summer — moong, watermelon, cucumber",
  },
  {
    id: "summer",
    label: "Summer",
    months: "Mar – Jun",
    description: "Irrigated hot-season crops",
  },
  {
    id: "winter",
    label: "Winter",
    months: "Nov – Feb",
    description: "Cool-season vegetables and grains",
  },
]

export function getCurrentSeasonHint(): IndianSeason {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 9) return "kharif"
  if (month >= 10 && month <= 2) return "rabi"
  if (month >= 3 && month <= 4) return "zaid"
  if (month === 5) return "summer"
  return "kharif"
}
