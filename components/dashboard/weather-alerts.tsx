"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sun, Loader2 } from "lucide-react"
import type { LocationData } from "@/lib/agri-types"
import { cn } from "@/lib/utils"

interface AlertItem {
  id: string
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  advice: string
}

interface WeatherAlertsProps {
  location: LocationData | null
}

export function WeatherAlerts({ location }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  useEffect(() => {
    if (!location) {
      setAlerts([])
      setSummary(null)
      return
    }

    const load = async () => {
      setLoading(true)
      setAlerts([])
      setSummary(null)

      try {
        const res = await fetch(
          `/api/weather-alerts?lat=${location.lat}&lng=${location.lng}`
        )

        if (!res.ok) {
          throw new Error(`Weather alert service failed: ${res.status}`)
        }

        const data = await res.json()
        const result = data.result

        if (result?.alerts && Array.isArray(result.alerts)) {
          setAlerts(result.alerts)
          setSummary(result.summary ?? null)
        } else {
          throw new Error("Invalid AI response format")
        }
      } catch (err) {
        setAlerts([
          {
            id: "unavailable",
            severity: "info",
            title: "Weather alerts unavailable",
            message: "Unable to generate AI weather guidance right now.",
            advice: "Try again in a few minutes or check your internet connection.",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [location])

  if (!location) return null

  const levelStyle = {
    info: "bg-chart-3/10 border-chart-3/30",
    warning: "bg-amber-500/10 border-amber-500/40",
    critical: "bg-destructive/10 border-destructive/40",
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading smart alerts...
        </div>
      ) : (
        <>
          {summary && (
            <Card className="border bg-slate-50 p-3">
              <CardContent className="p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Forecast summary</p>
                <p className="mt-2 text-sm text-slate-700">{summary}</p>
              </CardContent>
            </Card>
          )}
          {alerts.map((alert) => (
            <Card key={alert.id} className={cn("border py-2", levelStyle[alert.severity])}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold">{alert.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{alert.message}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-600">Advice: {alert.advice}</p>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
