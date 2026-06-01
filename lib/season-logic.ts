import type { IndianSeason } from "./agri-types"

export function getSeasonForMonth(month: number): IndianSeason {
  if (month >= 6 && month <= 9) return "kharif"
  if (month === 10 || month === 11) return "rabi"
  if (month === 12 || month === 1 || month === 2) return "rabi"
  if (month === 3 || month === 4) return "zaid"
  if (month === 5) return "summer"
  return "kharif"
}

export function isCropInSeason(cropSeasons: IndianSeason[], active: IndianSeason): boolean {
  return cropSeasons.includes(active) || cropSeasons.includes("all")
}
