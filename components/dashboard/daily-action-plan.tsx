"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  CalendarCheck,
  Droplets,
  FlaskConical,
  Bug,
  Sprout,
  AlertTriangle,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buildDailyPlan, getDailyInputsSummary } from "@/lib/daily-plan"
import type { CropProfile } from "@/lib/agri-types"

const categoryIcon = {
  water: Droplets,
  fertilizer: FlaskConical,
  pest: Bug,
  harvest: Sprout,
  soil: Sprout,
  market: Sprout,
}

const priorityStyle = {
  high: "border-l-red-600 bg-red-50/60 dark:bg-red-950/20",
  medium: "border-l-primary bg-primary/5",
  low: "border-l-stone-400",
}

interface DailyActionPlanProps {
  crop: CropProfile | null
}

export function DailyActionPlan({ crop }: DailyActionPlanProps) {
  if (!crop) {
    return (
      <Card className="flex h-full flex-col border-primary/15">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Daily Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          Select a crop from Crop Planner for water, fertilizer &amp; pesticide limits.
        </CardContent>
      </Card>
    )
  }

  const tasks = buildDailyPlan(crop)
  const summary = getDailyInputsSummary(crop)
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })

  return (
    <Card className="flex h-full flex-col border-primary/15 bg-gradient-to-b from-card to-primary/[0.04]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarCheck className="h-4 w-4 text-primary" />
          Daily Action Plan
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {today} · <span className="font-medium text-foreground">{crop.name}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 overflow-hidden p-3 pt-0">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 space-y-2 text-[11px]">
          <div>
            <p className="font-semibold text-primary flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Water today
            </p>
            <p className="font-bold text-sm">
              {summary.waterMin.toLocaleString("en-IN")} – {summary.waterMax.toLocaleString("en-IN")} L/acre
            </p>
            <p className="text-destructive font-medium">MAX: {summary.waterMax.toLocaleString("en-IN")} L — never exceed</p>
          </div>
          <Separator />
          {summary.fertilizers.map((f) => (
            <div key={f.name}>
              <p className="font-semibold flex items-center gap-1">
                <FlaskConical className="h-3 w-3" /> {f.name}
              </p>
              <p>Safe: {f.safe}</p>
              <p className="text-destructive font-medium">MAX: {f.max}</p>
            </div>
          ))}
          <Separator />
          {summary.pesticides.slice(0, 2).map((p) => (
            <div key={p.name}>
              <p className="font-semibold flex items-center gap-1">
                <Bug className="h-3 w-3" /> {p.name}
              </p>
              <p className="text-muted-foreground">{p.safe}</p>
              <p className="text-destructive font-medium text-[10px]">MAX: {p.max}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 rounded-lg border border-amber-300/50 bg-amber-50/90 dark:bg-amber-950/30 px-2 py-1.5 text-[10px]">
          <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
          Overuse of urea &amp; pesticides destroys soil for future generations.
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-2">
            {tasks.map((task, i) => {
              const Icon = categoryIcon[task.category]
              return (
                <div
                  key={i}
                  className={cn("rounded-lg border-l-4 border bg-card p-2.5", priorityStyle[task.priority])}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {task.time}
                    </span>
                    <Badge variant="outline" className="h-5 text-[10px] capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.detail}</p>
                  {task.warning && (
                    <p className="mt-1 flex gap-1 rounded bg-destructive/10 p-1 text-[10px] font-medium text-destructive">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {task.warning}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
