import type { ClimateData, CropProfile, CropRecommendation, IndianSeason } from "./agri-types"
import type { IndiaRegion } from "./region-logic"
import { REGION_CROP_BONUS } from "./region-logic"
import { isCropInSeason } from "./season-logic"

export const CROP_DATABASE: CropProfile[] = [
  {
    id: "rice",
    name: "Rice (Paddy)",
    nameHi: "धान",
    seasons: ["kharif"],
    waterNeeds: "high",
    waterLitersPerDayPerAcre: { min: 8000, max: 12000 },
    temperatureRange: "20–35°C",
    soilType: "Clay loam, puddled fields",
    harvestTime: "120–150 days",
    description: "Staple Kharif crop for irrigated and rainfed lowlands across India.",
    tips: [
      "Transplant 25–30 day seedlings in standing water",
      "Maintain 5–7 cm water depth till flowering",
      "Drain 10 days before harvest",
    ],
    sustainabilityNotes: [
      "Avoid continuous flooding — alternate wetting & drying saves 30% water",
      "Do not exceed urea limits — causes soil acidity and groundwater nitrate",
    ],
    seedBrands: ["IR-64", "PB-1509", "Swarna", "BPT-5204"],
    pesticideBrands: ["Cartap hydrochloride (as per label)", "Chlorantraniliprole (staggered)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "40–50 kg N",
        maxLimit: "60 kg N/acre — NEVER exceed",
        warning: "Over-urea burns roots and pollutes groundwater",
      },
      {
        name: "DAP",
        safePerAcre: "50 kg at basal",
        maxLimit: "60 kg/acre max",
        warning: "Excess DAP locks zinc in soil",
      },
    ],
    mandiHint: "Sell within 15 days of harvest when moisture is 14%",
    bestSellWindow: "Oct–Nov (Kharif arrival)",
  },
  {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    seasons: ["rabi"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 3000, max: 5000 },
    temperatureRange: "12–25°C",
    soilType: "Loamy, well-drained",
    harvestTime: "110–130 days",
    description: "Primary Rabi grain for North & Central India plains.",
    tips: [
      "Sow by mid-November for best yield",
      "First irrigation at crown root initiation (21 days)",
      "Avoid late nitrogen after jointing",
    ],
    sustainabilityNotes: [
      "Rice-wheat rotation depletes groundwater — consider legume break crop",
      "Split urea in 3 doses, not single heavy dose",
    ],
    seedBrands: ["HD-3086", "PBW-725", "WH-1105", "DBW-187"],
    pesticideBrands: ["Propiconazole (rust)", "Sulfosulfuron (weeds, label rate)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "80 kg N split in 3",
        maxLimit: "100 kg N/acre max",
        warning: "Late heavy urea causes lodging",
      },
      {
        name: "DAP",
        safePerAcre: "50 kg basal",
        maxLimit: "60 kg/acre",
        warning: "Excess phosphorus reduces zinc uptake",
      },
    ],
    mandiHint: "MSP mandis peak Apr–May",
    bestSellWindow: "Apr–May (Rabi procurement)",
    popularIn: ["Punjab", "Haryana", "UP", "MP"],
  },
  {
    id: "maize",
    name: "Maize",
    nameHi: "मक्का",
    seasons: ["kharif", "zaid"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 3500, max: 5500 },
    temperatureRange: "18–32°C",
    soilType: "Well-drained loam",
    harvestTime: "90–110 days",
    description: "Major Kharif cereal in Telangana, AP, Karnataka; food and fodder.",
    tips: [
      "Sow with onset of monsoon or irrigated Zaid",
      "Critical water at knee-high and tasseling stages",
      "Fall armyworm scouting from 30 DAS",
    ],
    sustainabilityNotes: [
      "Split urea in 3 doses — single dump wastes money and pollutes water",
      "Rotate with redgram or groundnut to restore nitrogen",
    ],
    seedBrands: ["DHM-117", "PMH-1", "NK-6240", "Pioneer 3396"],
    pesticideBrands: ["Spinosad (fall armyworm, ETL)", "Emamectin benzoate (label dose)"],
    pesticides: [
      {
        name: "Spinosad (fall armyworm)",
        safeUse: "Evening spray when 10% plants show fresh leaf damage",
        maxLimit: "Max 2 sprays per crop per label interval",
        warning: "Avoid morning spray — protects bees",
      },
    ],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "80 kg N in 3 splits",
        maxLimit: "100 kg N/acre — NEVER exceed",
        warning: "Excess N causes lodging and poor grain fill",
      },
      {
        name: "DAP",
        safePerAcre: "50 kg basal",
        maxLimit: "60 kg/acre max",
        warning: "Excess DAP in dry soil burns seedlings",
      },
    ],
    mandiHint: "Local grain mandis Sep–Oct; poultry feed demand steady",
    bestSellWindow: "Sep–Oct (Kharif harvest)",
    popularIn: ["Telangana", "Andhra Pradesh", "Karnataka", "Bihar"],
  },
  {
    id: "chilli",
    name: "Chilli",
    nameHi: "मिर्च",
    seasons: ["kharif", "rabi", "zaid"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 3000, max: 5000 },
    temperatureRange: "20–30°C",
    soilType: "Red/black well-drained loam",
    harvestTime: "120–150 days (multiple picks)",
    description: "High-value spice for Guntur, Khammam, Warangal, Byadgi belts.",
    tips: [
      "Drip irrigation + mulching essential",
      "Transplant 30–35 day old seedlings",
      "Harvest red ripe pods for export grade",
    ],
    sustainabilityNotes: [
      "Chilli attracts thrips — use yellow traps before chemicals",
      "Never exceed abamectin sprays; observe PHI before harvest",
    ],
    seedBrands: ["Teja", "Byadgi", "Arka Harita", "Guntur Sannam"],
    pesticideBrands: ["Neem oil 5%", "Abamectin (mites, ETL)", "Copper oxychloride"],
    pesticides: [
      {
        name: "Neem oil 5%",
        safeUse: "Preventive for thrips in vegetative stage — evening spray",
        maxLimit: "Max 3% concentration; stop 7 days before chemical spray",
        warning: "Not sufficient alone in heavy infestation",
      },
    ],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "50 kg N split",
        maxLimit: "65 kg N/acre max",
        warning: "Excess N → leafy plants, fewer fruits",
      },
    ],
    mandiHint: "Guntur & Hyderabad chilli yards — grade by colour and moisture",
    bestSellWindow: "Mar–May & Sep–Nov peak demand",
    popularIn: ["Andhra Pradesh", "Telangana", "Karnataka"],
  },
  {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    seasons: ["kharif"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 4000, max: 7000 },
    temperatureRange: "21–35°C",
    soilType: "Black cotton soil, sandy loam",
    harvestTime: "150–180 days",
    description: "Major cash crop for Gujarat, Maharashtra, Telangana.",
    tips: [
      "Use Bt cotton only from licensed dealers",
      "Scout for pink bollworm weekly after 60 DAS",
      "Pick in 3–4 intervals for quality",
    ],
    sustainabilityNotes: [
      "IPM first — avoid calendar spraying of pesticides",
      "Do not burn crop residue — mulch or incorporate",
    ],
    seedBrands: ["RCH-659", "MRC-7017", "Bunny Bt", "Ankur-651"],
    pesticideBrands: ["Emamectin benzoate", "Spiromesifen (mites, label only)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "100 kg N split",
        maxLimit: "120 kg N/acre",
        warning: "Excess N → vegetative growth, low boll set",
      },
    ],
    mandiHint: "Cotton Corporation mandis Oct–Jan",
    bestSellWindow: "Nov–Jan (post-harvest ginning)",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    seasons: ["kharif", "rabi"],
    waterNeeds: "high",
    waterLitersPerDayPerAcre: { min: 10000, max: 15000 },
    temperatureRange: "24–38°C",
    soilType: "Deep fertile loam",
    harvestTime: "12–18 months",
    description: "Long-duration crop; high water and nutrient demand.",
    tips: ["Trash mulching saves 20% irrigation", "Ratoon only if disease-free"],
    sustainabilityNotes: [
      "Sugarcane is water-intensive — drip strongly recommended",
      "Avoid burning leaves before harvest",
    ],
    seedBrands: ["Co-0238", "CoS-767", "CoJ-85"],
    pesticideBrands: ["Chlorantraniliprole (top borer)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "250 kg N in splits",
        maxLimit: "280 kg N/acre",
        warning: "Over-fertilization reduces sugar recovery",
      },
    ],
    mandiHint: "Crushing season Nov–Apr",
    bestSellWindow: "Dec–Mar (higher recovery period)",
  },
  {
    id: "mustard",
    name: "Mustard",
    nameHi: "सरसों",
    seasons: ["rabi"],
    waterNeeds: "low",
    waterLitersPerDayPerAcre: { min: 1500, max: 2500 },
    temperatureRange: "10–25°C",
    soilType: "Loamy, light soils",
    harvestTime: "110–130 days",
    description: "Oilseed Rabi crop for Rajasthan, Haryana, UP.",
    tips: ["Sow by Oct 25", "Two irrigations critical at flowering & pod fill"],
    sustainabilityNotes: ["Low pesticide need if sown early — avoid prophylactic sprays"],
    seedBrands: ["RH-749", "Pusa Bold", "Maya"],
    pesticideBrands: ["Deltamethrin (aphid, ETL only)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "40 kg N",
        maxLimit: "50 kg N/acre",
        warning: "Excess N delays maturity",
      },
    ],
    mandiHint: "Oil mills buy Mar–Apr",
    bestSellWindow: "Mar–Apr",
  },
  {
    id: "groundnut",
    name: "Groundnut",
    nameHi: "मूंगफली",
    seasons: ["kharif", "rabi", "zaid"],
    waterNeeds: "low",
    waterLitersPerDayPerAcre: { min: 2000, max: 3500 },
    temperatureRange: "25–35°C",
    soilType: "Sandy loam, well-drained",
    harvestTime: "100–130 days",
    description: "Drought-tolerant legume; fixes nitrogen in soil.",
    tips: ["Calcium application at pegging", "Harvest when leaves turn yellow"],
    sustainabilityNotes: ["Excellent rotation crop — reduces next crop fertilizer need"],
    seedBrands: ["TG-37A", "GG-20", "Kadiri-6"],
    pesticideBrands: ["Chlorpyrifos (soil grubs, only if needed)"],
    fertilizers: [
      {
        name: "DAP",
        safePerAcre: "40 kg basal",
        maxLimit: "50 kg/acre",
        warning: "Minimal N needed — legume fixes nitrogen",
      },
    ],
    mandiHint: "Gujarat & AP mandis Oct–Feb",
    bestSellWindow: "Oct–Jan",
  },
  {
    id: "millet",
    name: "Millet (Bajra/Jowar)",
    nameHi: "बाजरा/ज्वार",
    seasons: ["kharif", "zaid"],
    waterNeeds: "low",
    waterLitersPerDayPerAcre: { min: 1500, max: 3000 },
    temperatureRange: "26–35°C",
    soilType: "Sandy, light soils",
    harvestTime: "60–90 days",
    description: "Climate-resilient coarse grain for arid and semi-arid zones.",
    tips: ["One irrigation at flowering if rain fails", "Ideal for water-scarce regions"],
    sustainabilityNotes: ["Lowest water footprint among cereals — promote for dry areas"],
    seedBrands: ["HHB-67", "PCB-164", "CSV-17"],
    pesticideBrands: ["Neem-based sprays preferred"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "30 kg N",
        maxLimit: "40 kg N/acre",
        warning: "Millets need less fertilizer than rice/wheat",
      },
    ],
    mandiHint: "Local haat & FCI procurement",
    bestSellWindow: "Sep–Nov",
  },
  {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    seasons: ["kharif"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 3500, max: 5500 },
    temperatureRange: "20–30°C",
    soilType: "Black soil, well-drained",
    harvestTime: "90–110 days",
    description: "Major oilseed of Madhya Pradesh and Maharashtra.",
    tips: ["Rhizobium seed treatment", "Critical irrigation at pod development"],
    sustainabilityNotes: ["Avoid unnecessary fungicide sprays — scout first"],
    seedBrands: ["JS-9560", "NRC-7", "MACS-1407"],
    pesticideBrands: ["Hexaconazole (rust, if threshold crossed)"],
    fertilizers: [
      {
        name: "DAP",
        safePerAcre: "40 kg basal",
        maxLimit: "50 kg/acre",
        warning: "Legume — minimal nitrogen top-dress",
      },
    ],
    mandiHint: "Indore & Latur mandis Oct",
    bestSellWindow: "Oct–Nov",
  },
  {
    id: "tomato",
    name: "Tomato",
    nameHi: "टमाटर",
    seasons: ["rabi", "zaid", "winter"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 4000, max: 6000 },
    temperatureRange: "18–29°C",
    soilType: "Rich well-drained loam",
    harvestTime: "60–90 days",
    description: "High-value vegetable; drip irrigation recommended.",
    tips: ["Stake plants", "Mulch to reduce blight", "Harvest at breaker stage for transport"],
    sustainabilityNotes: ["Drip + mulch cuts water use by 40%", "Rotate to break soil-borne disease"],
    seedBrands: ["Pusa Ruby", "Arka Vikas", "Namdhari hybrids"],
    pesticideBrands: ["Copper oxychloride (preventive)", "Abamectin (mites, ETL)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "60 kg N in splits",
        maxLimit: "75 kg N/acre",
        warning: "Excess N → leafy plants, poor fruit",
      },
    ],
    mandiHint: "Perishables — sell within 2–3 days",
    bestSellWindow: "Winter (Dec–Feb) premium prices",
  },
  {
    id: "chickpea",
    name: "Chickpea (Chana)",
    nameHi: "चना",
    seasons: ["rabi"],
    waterNeeds: "low",
    waterLitersPerDayPerAcre: { min: 1500, max: 2500 },
    temperatureRange: "15–25°C",
    soilType: "Well-drained loam",
    harvestTime: "95–120 days",
    description: "Protein-rich pulse; low irrigation need.",
    tips: ["One light irrigation at flowering if dry", "Watch for pod borer at 50% flowering"],
    sustainabilityNotes: ["Pulse rotation restores soil nitrogen for next cereal"],
    seedBrands: ["Pusa-372", "JG-11", "GNG-1581"],
    pesticideBrands: ["HaNPV for pod borer (biological first)"],
    fertilizers: [
      {
        name: "DAP",
        safePerAcre: "40 kg basal",
        maxLimit: "50 kg/acre",
        warning: "Do not over-fertilize pulses",
      },
    ],
    mandiHint: "Dal mills buy Mar–Apr",
    bestSellWindow: "Mar–Apr",
  },
  {
    id: "moong",
    name: "Moong (Green Gram)",
    nameHi: "मूंग",
    seasons: ["zaid", "kharif"],
    waterNeeds: "low",
    waterLitersPerDayPerAcre: { min: 1200, max: 2000 },
    temperatureRange: "25–35°C",
    soilType: "Sandy loam",
    harvestTime: "60–75 days",
    description: "Short-duration Zaid pulse; good for crop rotation.",
    tips: ["Sow after wheat harvest", "Minimal irrigation"],
    sustainabilityNotes: ["Excellent green manure if ploughed before harvest"],
    seedBrands: ["Pusa Vishal", "SML-668", "PDM-139"],
    pesticideBrands: ["Neem oil preferred"],
    fertilizers: [
      {
        name: "Rhizobium",
        safePerAcre: "Seed treatment only",
        maxLimit: "Avoid heavy chemical N",
        warning: "Legume fixes own nitrogen",
      },
    ],
    mandiHint: "Summer pulse mandis May–Jun",
    bestSellWindow: "May–Jun",
  },
  {
    id: "potato",
    name: "Potato",
    nameHi: "आलू",
    seasons: ["rabi", "winter"],
    waterNeeds: "medium",
    waterLitersPerDayPerAcre: { min: 3500, max: 5500 },
    temperatureRange: "15–22°C",
    soilType: "Sandy loam",
    harvestTime: "90–120 days",
    description: "Cool-season tuber crop for Indo-Gangetic plains.",
    tips: ["Earthing up at 25 DAP", "Store in ventilated godowns"],
    sustainabilityNotes: ["Excess irrigation causes late blight — avoid evening watering"],
    seedBrands: ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Chipsona"],
    pesticideBrands: ["Mancozeb (blight preventive)", "Metalaxyl (only if infected)"],
    fertilizers: [
      {
        name: "Urea",
        safePerAcre: "80 kg N split",
        maxLimit: "100 kg N/acre",
        warning: "Excess N → hollow tubers",
      },
    ],
    mandiHint: "Cold storage hubs — Agra, Indore",
    bestSellWindow: "Feb–Apr (Rabi crop)",
  },
]

function parseTempRange(range: string): [number, number] {
  const nums = range.match(/\d+/g)?.map(Number) ?? [15, 30]
  return [nums[0], nums[1] ?? nums[0] + 10]
}

export function determineClimate(temp: number, precip: number): string {
  if (temp > 25 && precip > 100) return "tropical"
  if (temp > 20 && precip > 50) return "subtropical"
  if (temp < 20 && precip > 30) return "temperate"
  if (precip < 30) return "arid"
  return "subtropical"
}

export function calculateSuitability(
  crop: CropProfile,
  climate: ClimateData,
  season: IndianSeason,
  region: IndiaRegion = "all_india"
): { suitability: number; seasonMatch: number } {
  let score = 0
  const [minTemp, maxTemp] = parseTempRange(crop.temperatureRange)
  const temp = climate.temperature

  if (temp >= minTemp && temp <= maxTemp) score += 35
  else if (temp >= minTemp - 5 && temp <= maxTemp + 5) score += 22
  else score += 8

  const precip = climate.precipitation
  if (crop.waterNeeds === "high" && precip > 100) score += 25
  else if (crop.waterNeeds === "high" && precip > 50) score += 15
  else if (crop.waterNeeds === "medium" && precip >= 30 && precip <= 150) score += 25
  else if (crop.waterNeeds === "low" && precip < 80) score += 25
  else score += 12

  const humidity = climate.humidity
  if (crop.waterNeeds === "high" && humidity > 60) score += 10
  else if (crop.waterNeeds === "low" && humidity < 65) score += 10
  else score += 5

  const zoneBonus: Record<string, string[]> = {
    tropical: ["rice", "sugarcane", "cotton", "chilli"],
    temperate: ["wheat", "potato", "mustard"],
    arid: ["millet", "groundnut", "mustard", "maize"],
    subtropical: ["soybean", "tomato", "cotton", "chickpea", "maize", "chilli", "rice"],
  }
  if (zoneBonus[climate.climate]?.includes(crop.id)) score += 12
  else score += 4

  if (REGION_CROP_BONUS[region]?.includes(crop.id)) score += 18
  else if (region !== "all_india" && crop.popularIn?.some((s) => s.toLowerCase().includes("telangana") || s.toLowerCase().includes("andhra"))) {
    score += 8
  }

  const inSeason = isCropInSeason(crop.seasons, season)
  const seasonMatch = inSeason ? 100 : 0
  const seasonBonus = inSeason ? 15 : -25
  score += seasonBonus

  return {
    suitability: Math.min(Math.max(score, 0), 100),
    seasonMatch,
  }
}

export function rankCrops(
  climate: ClimateData,
  season: IndianSeason,
  region: IndiaRegion = "all_india"
): CropRecommendation[] {
  return CROP_DATABASE.map((crop) => {
    const { suitability, seasonMatch } = calculateSuitability(crop, climate, season, region)
    return { ...crop, suitability, seasonMatch, selected: false }
  }).sort((a, b) => {
    if (b.seasonMatch !== a.seasonMatch) return b.seasonMatch - a.seasonMatch
    return b.suitability - a.suitability
  })
}

export function getCropById(id: string): CropProfile | undefined {
  return CROP_DATABASE.find((c) => c.id === id)
}
