import type { CropProfile } from "./agri-types"

export interface DailyTask {
  time: string
  title: string
  detail: string
  priority: "high" | "medium" | "low"
  category: "water" | "fertilizer" | "pest" | "soil" | "market"
  warning?: string
}

export interface DailyInputsSummary {
  waterMin: number
  waterMax: number
  fertilizers: { name: string; safe: string; max: string; warning: string }[]
  pesticides: { name: string; safe: string; max: string; warning: string }[]
}

function buildPesticides(crop: CropProfile) {
  if (crop.pesticides?.length) return crop.pesticides
  return crop.pesticideBrands.map((name) => ({
    name,
    safeUse: "Apply only at economic threshold (ETL) — follow product label",
    maxLimit: "Do not exceed label dose or spray interval",
    warning: "Over-spraying kills natural enemies and poisons soil & water",
  }))
}

export function getDailyInputsSummary(crop: CropProfile): DailyInputsSummary {
  return {
    waterMin: crop.waterLitersPerDayPerAcre.min,
    waterMax: crop.waterLitersPerDayPerAcre.max,
    fertilizers: crop.fertilizers.map((f) => ({
      name: f.name,
      safe: f.safePerAcre,
      max: f.maxLimit,
      warning: f.warning,
    })),
    pesticides: buildPesticides(crop).map((p) => ({
      name: p.name,
      safe: p.safeUse,
      max: p.maxLimit,
      warning: p.warning,
    })),
  }
}

export function buildDailyPlan(crop: CropProfile, dayOffset = 0): DailyTask[] {
  const water = crop.waterLitersPerDayPerAcre
  const urea = crop.fertilizers.find((f) => f.name === "Urea")
  const dap = crop.fertilizers.find((f) => f.name === "DAP")
  const pesticides = buildPesticides(crop)
  const primaryPest = pesticides[0]

  const tasks: DailyTask[] = [
    {
      time: "6:00 AM",
      title: "Field walk (चक्र भ्रमण)",
      detail: `Inspect ${crop.name} for pests, yellowing, and weeds. Note problem areas.`,
      priority: "medium",
      category: "soil",
    },
    {
      time: "7:00 AM",
      title: "Irrigation (सिंचाई)",
      detail: `Apply ${water.min.toLocaleString("en-IN")}–${water.max.toLocaleString("en-IN")} litres per acre. Prefer early morning or evening.`,
      priority: "high",
      category: "water",
      warning: `MAX WATER: ${water.max.toLocaleString("en-IN")} L/acre/day — NEVER exceed. Protects groundwater for future generations.`,
    },
    {
      time: "9:00 AM",
      title: "Moisture check",
      detail: "Dig 15 cm — if soil holds shape when squeezed, skip irrigation today.",
      priority: "medium",
      category: "water",
    },
  ]

  if (dayOffset % 7 === 0 && urea) {
    tasks.push({
      time: "10:00 AM",
      title: `Fertilizer — ${urea.name}`,
      detail: `Safe dose: ${urea.safePerAcre}. Apply in split doses with irrigation.`,
      priority: "high",
      category: "fertilizer",
      warning: `MAX LIMIT: ${urea.maxLimit}. ${urea.warning}`,
    })
  }

  if (dayOffset % 14 === 3 && dap) {
    tasks.push({
      time: "10:30 AM",
      title: `Basal — ${dap.name}`,
      detail: `Safe: ${dap.safePerAcre}. Never apply on waterlogged soil.`,
      priority: "medium",
      category: "fertilizer",
      warning: `MAX LIMIT: ${dap.maxLimit}. ${dap.warning}`,
    })
  }

  tasks.push({
    time: "4:00 PM",
    title: "Pest scouting (IPM)",
    detail: primaryPest
      ? `${primaryPest.name}: ${primaryPest.safeUse}`
      : "Spray ONLY if pest crosses ETL. Use neem/bio first.",
    priority: "high",
    category: "pest",
    warning: primaryPest
      ? `MAX: ${primaryPest.maxLimit}. ${primaryPest.warning}`
      : "Calendar spraying without scouting wastes money and damages soil biology.",
  })

  tasks.push({
    time: "5:00 PM",
    title: "Sustainability check",
    detail: crop.sustainabilityNotes[0] ?? "Reduce chemicals each season; add compost/FYM.",
    priority: "medium",
    category: "soil",
    warning: "Overuse of urea & pesticides acidifies soil and harms earthworms long-term.",
  })

  return tasks
}
