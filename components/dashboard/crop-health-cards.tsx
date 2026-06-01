"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Leaf,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CropData {
  id: string
  name: string
  field: string
  health: number
  moisture: number
  temperature: number
  sunlight: number
  trend: "up" | "down" | "stable"
  alert?: string
}

const crops: CropData[] = [
  {
    id: "1",
    name: "Corn",
    field: "North Field",
    health: 92,
    moisture: 78,
    temperature: 24,
    sunlight: 85,
    trend: "up",
  },
  {
    id: "2",
    name: "Soybeans",
    field: "East Field",
    health: 68,
    moisture: 45,
    temperature: 26,
    sunlight: 90,
    trend: "down",
    alert: "Low soil moisture detected",
  },
  {
    id: "3",
    name: "Wheat",
    field: "South Field",
    health: 45,
    moisture: 32,
    temperature: 28,
    sunlight: 95,
    trend: "down",
    alert: "Critical: Irrigation needed",
  },
  {
    id: "4",
    name: "Alfalfa",
    field: "West Field",
    health: 95,
    moisture: 82,
    temperature: 22,
    sunlight: 75,
    trend: "up",
  },
]

function getHealthColor(health: number) {
  if (health >= 80) return "text-chart-1"
  if (health >= 60) return "text-chart-2"
  if (health >= 40) return "text-chart-4"
  return "text-destructive"
}

function getProgressColor(health: number) {
  if (health >= 80) return "bg-chart-1"
  if (health >= 60) return "bg-chart-2"
  if (health >= 40) return "bg-chart-4"
  return "bg-destructive"
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
  }
  if (trend === "down") {
    return <TrendingDown className="h-3.5 w-3.5 text-destructive" />
  }
  return null
}

export function CropHealthCards() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Leaf className="h-4 w-4 text-primary" />
          Crop Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="grid gap-3">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className={cn(
                "rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50",
                crop.alert && "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{crop.name}</h4>
                    <TrendIcon trend={crop.trend} />
                  </div>
                  <p className="text-xs text-muted-foreground">{crop.field}</p>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-xl font-bold",
                      getHealthColor(crop.health)
                    )}
                  >
                    {crop.health}%
                  </span>
                  <p className="text-xs text-muted-foreground">Health</p>
                </div>
              </div>

              <div className="mb-3">
                <Progress
                  value={crop.health}
                  className="h-1.5"
                  style={
                    {
                      "--progress-background": `var(--${
                        crop.health >= 80
                          ? "chart-1"
                          : crop.health >= 60
                          ? "chart-2"
                          : crop.health >= 40
                          ? "chart-4"
                          : "destructive"
                      })`,
                    } as React.CSSProperties
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-chart-3" />
                  <span className="text-muted-foreground">{crop.moisture}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-chart-5" />
                  <span className="text-muted-foreground">{crop.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-chart-4" />
                  <span className="text-muted-foreground">{crop.sunlight}%</span>
                </div>
              </div>

              {crop.alert && (
                <div className="mt-2 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {crop.alert}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
