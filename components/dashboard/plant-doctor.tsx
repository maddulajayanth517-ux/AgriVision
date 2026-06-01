"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Camera,
  Upload,
  Loader2,
  Leaf,
  AlertTriangle,
  ShieldCheck,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  condition: string
  confidence: number
  severity: "low" | "medium" | "high"
  treatment: string[]
  sustainableNote: string
}

const MOCK_ANALYSES: AnalysisResult[] = [
  {
    condition: "Leaf blast (Pyricularia) — early stage",
    confidence: 78,
    severity: "medium",
    treatment: [
      "Remove heavily infected leaves and burn away from field",
      "Tricyclazole 75 WP @ label dose — only if spreading",
      "Improve drainage; avoid excess nitrogen",
    ],
    sustainableNote:
      "Do NOT spray prophylactically every week. One correct spray at ETL saves cost and protects beneficial insects.",
  },
  {
    condition: "Aphid infestation — moderate",
    confidence: 82,
    severity: "low",
    treatment: [
      "Spray neem oil 5% in evening",
      "Release natural predators; avoid broad-spectrum insecticides first",
      "Monitor daily for 5 days before chemical fallback",
    ],
    sustainableNote: "Overuse of synthetic pesticides kills pollinators and increases pest resurgence.",
  },
  {
    condition: "Nutrient deficiency (N) — yellowing lower leaves",
    confidence: 71,
    severity: "low",
    treatment: [
      "Split urea application — never single heavy dose",
      "Soil test before adding more chemical fertilizer",
      "Consider FYM or green manure for long-term soil health",
    ],
    sustainableNote: "Excess urea causes lodging, water pollution, and soil acidification over years.",
  },
]

interface PlantDoctorProps {
  cropName?: string
}

export function PlantDoctor({ cropName }: PlantDoctorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const runAnalysis = async () => {
    if (!preview) return
    setIsAnalyzing(true)
    await new Promise((r) => setTimeout(r, 1800))
    const pick = MOCK_ANALYSES[Math.floor(Math.random() * MOCK_ANALYSES.length)]
    setResult(pick)
    setIsAnalyzing(false)
  }

  const clear = () => {
    setPreview(null)
    setFileName(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const severityColor = {
    low: "bg-chart-1/15 text-chart-1 border-chart-1/30",
    medium: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    high: "bg-destructive/15 text-destructive border-destructive/30",
  }

  return (
    <Card className="flex h-full flex-col border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Camera className="h-4 w-4 text-primary" />
          Plant Doctor
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Upload a clear leaf/plant photo{cropName ? ` — ${cropName}` : ""}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-3 pt-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-1 min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10 active:scale-[0.99]"
          >
            <div className="rounded-full bg-primary/15 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium">Tap to upload or take photo</span>
            <span className="text-xs text-muted-foreground text-center px-4">
              Good light, focus on affected leaves. Works on mobile camera.
            </span>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Plant sample"
              className="max-h-36 w-full object-cover"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={clear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            {fileName && (
              <p className="truncate px-2 py-1 text-[10px] text-muted-foreground bg-muted/80">
                {fileName}
              </p>
            )}
          </div>
        )}

        {preview && !result && (
          <Button
            className="w-full gap-2"
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI Saathi is analyzing…
              </>
            ) : (
              <>
                <Leaf className="h-4 w-4" />
                Analyze with AI Saathi
              </>
            )}
          </Button>
        )}

        {result && (
          <div className="space-y-2 overflow-auto flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", severityColor[result.severity])}>
                {result.severity} risk
              </Badge>
              <span className="text-xs text-muted-foreground">
                Confidence: {result.confidence}%
              </span>
            </div>
            <p className="text-sm font-medium">{result.condition}</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {result.treatment.map((t, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-primary">•</span>
                  {t}
                </li>
              ))}
            </ul>
            <Alert className="border-primary/20 bg-primary/5 py-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <AlertTitle className="text-xs font-medium">Sustainability</AlertTitle>
              <AlertDescription className="text-[11px]">
                {result.sustainableNote}
              </AlertDescription>
            </Alert>
            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              Demo analysis — confirm with local KVK before spraying chemicals.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
