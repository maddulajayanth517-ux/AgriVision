"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Loader2,
} from "lucide-react"
import type { LocationData } from "@/lib/agri-types"

interface StatCardProps {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  subtitle?: string
  loading?: boolean
}

function StatCard({ title, value, unit, icon, subtitle, loading }: StatCardProps) {
  return (
    <Card className="bg-card border-primary/5">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{title}</p>
            <div className="mt-1 flex items-baseline gap-1">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <span className="text-xl sm:text-2xl font-bold">{value}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{unit}</span>
                </>
              )}
            </div>
            {subtitle && !loading && (
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 shrink-0">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  location: LocationData | null
}

export function StatsCards({ location }: StatsCardsProps) {
  const [stats, setStats] = useState({
    temp: "24",
    humidity: "68",
    wind: "12",
    precip: "0",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) return

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`
        )
        const data = await res.json()
        setStats({
          temp: data.current.temperature_2m?.toFixed(0) ?? "—",
          humidity: data.current.relative_humidity_2m?.toFixed(0) ?? "—",
          wind: data.current.wind_speed_10m?.toFixed(0) ?? "—",
          precip: String(data.current.precipitation ?? 0),
        })
      } catch {
        /* keep defaults */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location])

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
      <StatCard
        title="Temperature"
        value={stats.temp}
        unit="°C"
        icon={<Thermometer className="h-4 w-4 text-chart-5" />}
        loading={loading && !!location}
      />
      <StatCard
        title="Humidity"
        value={stats.humidity}
        unit="%"
        icon={<Droplets className="h-4 w-4 text-chart-3" />}
        subtitle={location ? "Live from your field" : "Search location on map"}
        loading={loading && !!location}
      />
      <StatCard
        title="Wind"
        value={stats.wind}
        unit="km/h"
        icon={<Wind className="h-4 w-4 text-muted-foreground" />}
        loading={loading && !!location}
      />
      <StatCard
        title="Rain now"
        value={stats.precip}
        unit="mm"
        icon={<Cloud className="h-4 w-4 text-chart-3" />}
        loading={loading && !!location}
      />
    </div>
  )
}
