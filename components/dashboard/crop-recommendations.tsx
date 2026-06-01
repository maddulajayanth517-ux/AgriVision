"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sprout,
  Droplets,
  Thermometer,
  Sun,
  Wind,
  CloudRain,
  Check,
  Loader2,
  MapPin,
  Leaf,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Shield,
  FlaskConical,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClimateData, CropRecommendation, IndianSeason, LocationData } from "@/lib/agri-types"
import { INDIAN_SEASONS, getCurrentSeasonHint } from "@/lib/agri-types"
import { determineClimate, rankCrops } from "@/lib/crop-data"
import { getRegionLabel } from "@/lib/region-logic"

interface CropRecommendationsProps {
  location: LocationData | null
  selectedCropId: string | null
  onSelectCrop: (crop: CropRecommendation | null) => void
  onSeasonChange?: (season: IndianSeason) => void
}

export function CropRecommendations({
  location,
  selectedCropId,
  onSelectCrop,
  onSeasonChange,
}: CropRecommendationsProps) {
  const [season, setSeason] = useState<IndianSeason>(getCurrentSeasonHint())

  const handleSeasonChange = (value: IndianSeason) => {
    setSeason(value)
    onSeasonChange?.(value)
  }
  const [climateData, setClimateData] = useState<ClimateData | null>(null)
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!location) {
      setClimateData(null)
      setRecommendations([])
      return
    }

    const fetchClimateData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto`
        )

        if (!response.ok) throw new Error("Failed to fetch weather data")

        const data = await response.json()
        const avgTemp = data.current.temperature_2m
        const humidity = data.current.relative_humidity_2m
        const precipSum: number[] = data.daily.precipitation_sum
        const precip =
          (precipSum.reduce((a: number, b: number) => a + b, 0) / 7) * 30

        const climate: ClimateData = {
          temperature: avgTemp,
          humidity,
          precipitation: precip,
          windSpeed: data.current.wind_speed_10m,
          soilMoisture: Math.min(humidity * 0.8 + precip * 0.3, 100),
          uvIndex: data.daily.uv_index_max[0],
          climate: determineClimate(avgTemp, precip),
        }

        setClimateData(climate)
        setRecommendations(rankCrops(climate, season, location.region ?? "all_india"))
      } catch {
        setError("Unable to fetch climate data. Check connection and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClimateData()
  }, [location, season])

  useEffect(() => {
    if (climateData && location) {
      setRecommendations(rankCrops(climateData, season, location.region ?? "all_india"))
    }
  }, [season, climateData, location])

  const handleSelect = (crop: CropRecommendation) => {
    const next = selectedCropId === crop.id ? null : crop
    onSelectCrop(next)
  }

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 80) return "text-chart-1"
    if (suitability >= 60) return "text-chart-2"
    if (suitability >= 40) return "text-chart-4"
    return "text-destructive"
  }

  const getSuitabilityLabel = (suitability: number) => {
    if (suitability >= 80) return "Excellent"
    if (suitability >= 60) return "Good"
    if (suitability >= 40) return "Moderate"
    return "Poor"
  }

  if (!location) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sprout className="h-4 w-4 text-primary" />
            Crop Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-1 font-medium">Set your farm location</h3>
          <p className="text-sm text-muted-foreground">
            Search village, pincode (6 digits), or lat,lng on the map — get season-wise crop advice for your land.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sprout className="h-4 w-4 text-primary" />
          Crop Planner
        </CardTitle>
        <div className="flex flex-wrap items-center gap-1">
          <p className="truncate text-xs text-muted-foreground flex-1 min-w-0">
            {location.label}
            {location.pincode && ` · PIN ${location.pincode}`}
          </p>
          {location.region && (
            <Badge variant="secondary" className="text-[9px] h-5 shrink-0">
              {getRegionLabel(location.region)}
            </Badge>
          )}
        </div>
        <Select value={season} onValueChange={(v) => handleSeasonChange(v as IndianSeason)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {INDIAN_SEASONS.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.label} ({s.months})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 overflow-hidden p-3 pt-0">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing climate & season...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {climateData && (
              <div className="rounded-lg border bg-muted/30 p-2">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Land conditions
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-4">
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-chart-5" />
                    {climateData.temperature.toFixed(1)}°C
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-chart-3" />
                    {climateData.humidity.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3" />
                    ~{climateData.precipitation.toFixed(0)}mm/mo
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {climateData.windSpeed.toFixed(0)} km/h
                  </span>
                </div>
                <Badge variant="secondary" className="mt-1.5 text-[10px] capitalize">
                  {climateData.climate} zone
                </Badge>
              </div>
            )}

            <div className="flex items-start gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 text-[10px]">
              <Shield className="h-3 w-3 shrink-0 text-primary mt-0.5" />
              <span>We always show safe water & fertilizer limits — protect soil for the next generation.</span>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-2">
                {recommendations.slice(0, 8).map((crop) => {
                  const selected = selectedCropId === crop.id
                  const seasonOk = crop.seasonMatch > 0
                  return (
                    <Collapsible
                      key={crop.id}
                      open={expandedId === crop.id}
                      onOpenChange={(open) => setExpandedId(open ? crop.id : null)}
                    >
                      <div
                        className={cn(
                          "rounded-lg border p-2.5 transition-all",
                          selected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="text-sm font-semibold">{crop.name}</h4>
                              {crop.nameHi && (
                                <span className="text-[10px] text-muted-foreground">{crop.nameHi}</span>
                              )}
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] h-5", getSuitabilityColor(crop.suitability))}
                              >
                                {getSuitabilityLabel(crop.suitability)}
                              </Badge>
                              {!seasonOk && (
                                <Badge variant="destructive" className="text-[9px] h-5">
                                  Off-season
                                </Badge>
                              )}
                            </div>
                            <Progress value={crop.suitability} className="mt-1.5 h-1" />
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Droplets className="h-2.5 w-2.5" />
                                {crop.waterLitersPerDayPerAcre.min.toLocaleString()}–
                                {crop.waterLitersPerDayPerAcre.max.toLocaleString()} L/acre/day
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Sun className="h-2.5 w-2.5" />
                                {crop.harvestTime}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={cn("text-lg font-bold leading-none", getSuitabilityColor(crop.suitability))}>
                              {crop.suitability}%
                            </span>
                            <Button
                              variant={selected ? "default" : "outline"}
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSelect(crop)}
                            >
                              {selected ? <Check className="h-3.5 w-3.5" /> : <Leaf className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>

                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="mt-1 h-6 w-full text-[10px] gap-1">
                            Details, seeds & limits
                            <ChevronDown className={cn("h-3 w-3 transition-transform", expandedId === crop.id && "rotate-180")} />
                          </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-2 pt-2 text-xs">
                          <p className="text-muted-foreground">{crop.description}</p>

                          <div className="rounded-md border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-2">
                            <p className="mb-1 flex items-center gap-1 font-medium text-amber-900 dark:text-amber-100">
                              <AlertTriangle className="h-3 w-3" />
                              Maximum limits (do not exceed)
                            </p>
                            {crop.fertilizers.map((f) => (
                              <div key={f.name} className="mb-1.5 last:mb-0">
                                <p className="flex items-center gap-1 font-medium">
                                  <FlaskConical className="h-3 w-3" />
                                  {f.name}: safe {f.safePerAcre}
                                </p>
                                <p className="text-[10px] text-destructive font-medium">{f.maxLimit}</p>
                                <p className="text-[10px] text-muted-foreground">{f.warning}</p>
                              </div>
                            ))}
                          </div>

                          <div>
                            <p className="font-medium mb-0.5">Recommended seeds</p>
                            <div className="flex flex-wrap gap-1">
                              {crop.seedBrands.map((s) => (
                                <Badge key={s} variant="secondary" className="text-[10px]">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="font-medium mb-0.5 flex items-center gap-1">
                              <Store className="h-3 w-3" />
                              Market
                            </p>
                            <p className="text-muted-foreground">{crop.mandiHint}</p>
                            <p className="text-primary font-medium">{crop.bestSellWindow}</p>
                          </div>

                          {crop.sustainabilityNotes.map((n, i) => (
                            <p key={i} className="flex gap-1 text-[10px] text-primary/90">
                              <Shield className="h-3 w-3 shrink-0" />
                              {n}
                            </p>
                          ))}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                })}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  )
}
