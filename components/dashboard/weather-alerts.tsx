"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CloudRain, Sun, Bug, Droplets, Loader2 } from "lucide-react"
import type { LocationData } from "@/lib/agri-types"
import { cn } from "@/lib/utils"

interface AlertItem {
  id: string
  type: "rain" | "drought" | "pest" | "heat"
  title: string
  message: string
  level: "info" | "warning" | "critical"
}

interface WeatherAlertsProps {
  location: LocationData | null
}

export function WeatherAlerts({ location }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) {
      setAlerts([])
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&daily=precipitation_sum,temperature_2m_max,wind_speed_10m_max&forecast_days=7&timezone=auto`
        )
        const data = await res.json()
        const precip: number[] = data.daily?.precipitation_sum ?? []
        const temps: number[] = data.daily?.temperature_2m_max ?? []
        const totalRain = precip.reduce((a: number, b: number) => a + b, 0)
        const maxTemp = Math.max(...temps, 0)

        const items: AlertItem[] = []

        if (totalRain < 5) {
          items.push({
            id: "drought",
            type: "drought",
            title: "Low rainfall expected",
            message: "Plan irrigation; mulch soil to reduce evaporation. Avoid excess urea without water.",
            level: "warning",
          })
        }
        if (totalRain > 40) {
          items.push({
            id: "rain",
            type: "rain",
            title: "Heavy rain likely",
            message: "Delay spraying pesticides. Ensure field drainage. Store harvested grain dry.",
            level: "warning",
          })
        }
        if (maxTemp > 38) {
          items.push({
            id: "heat",
            type: "heat",
            title: "Heat stress risk",
            message: "Irrigate early morning or evening. Shade nursery seedlings.",
            level: "critical",
          })
        }
        if (location.lat > 8 && location.lat < 35 && totalRain > 15 && totalRain < 80) {
          items.push({
            id: "pest",
            type: "pest",
            title: "Pest outbreak risk (humid-warm)",
            message: "Scout for bollworm / leaf folder. Use IPM — spray only above economic threshold.",
            level: "info",
          })
        }

        if (items.length === 0) {
          items.push({
            id: "ok",
            type: "heat",
            title: "Weather stable",
            message: "No critical alerts for the next 7 days. Continue daily field monitoring.",
            level: "info",
          })
        }

        setAlerts(items)
      } catch {
        setAlerts([
          {
            id: "err",
            type: "drought",
            title: "Weather unavailable",
            message: "Check connection and location.",
            level: "info",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [location])

  if (!location) return null

  const iconMap = {
    rain: CloudRain,
    drought: Droplets,
    pest: Bug,
    heat: Sun,
  }

  const levelStyle = {
    info: "bg-chart-3/10 border-chart-3/30",
    warning: "bg-amber-500/10 border-amber-500/40",
    critical: "bg-destructive/10 border-destructive/40",
  }

  return (
    <div className="space-y-2">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading smart alerts...
        </div>
      ) : (
        alerts.map((a) => {
          const Icon = iconMap[a.type]
          return (
            <Card key={a.id} className={cn("border py-2", levelStyle[a.level])}>
              <CardContent className="flex gap-2 p-3 py-2">
                <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{a.message}</p>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
