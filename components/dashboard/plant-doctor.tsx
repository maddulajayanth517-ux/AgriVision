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

interface PlantDoctorProps {
  cropName?: string
}

interface DiseaseApiResult {
  detected: boolean
  diseaseName: string
  severity: "none" | "mild" | "moderate" | "severe" | "critical"
  confidence: number
  affectedParts: string[]
  symptoms: string[]
  causes: string[]
  treatment: {
    immediate: string[]
    chemical: string[]
    organic: string[]
    preventive: string[]
  }
  spreadRisk: "low" | "medium" | "high"
  estimatedYieldLoss: string
  urgency: "monitor" | "treat_soon" | "treat_immediately"
  additionalNotes: string
}

interface PlantDoctorResult {
  condition: string
  confidence: number
  severity: "low" | "medium" | "high"
  immediate: string[]
  chemical: string[]
  organic: string[]
  preventive: string[]
  sustainableNote: string
}

async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be analyzed.")
  }

  const bitmap = await createImageBitmap(file)
  const maxDimension = 256
  let width = bitmap.width
  let height = bitmap.height

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Unable to process the image.")
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas.toDataURL("image/jpeg", 0.75)
}

export function PlantDoctor({ cropName }: PlantDoctorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<PlantDoctorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid plant image.")
      return
    }

    setFileName(file.name)
    setResult(null)
    setError(null)

    try {
      const compressed = await compressImageFile(file)
      setPreview(compressed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to prepare image for analysis.")
    }
  }

  const runAnalysis = async () => {
    if (!preview) return
    setError(null)
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/disease-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview, cropType: cropName || "general crop" }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.error || "AI analysis failed. Check your API key and network.")
      }

      const disease: DiseaseApiResult = payload?.result
      if (!disease) {
        throw new Error("No analysis result returned. Please check the image and try again.")
      }

      setResult({
        condition: disease.diseaseName || "Unable to identify disease",
        confidence: disease.confidence ?? 0,
        severity:
          disease.severity === "critical" || disease.severity === "severe"
            ? "high"
            : disease.severity === "moderate"
            ? "medium"
            : "low",
        immediate: disease.treatment.immediate ?? [],
        chemical: disease.treatment.chemical ?? [],
        organic: disease.treatment.organic ?? [],
        preventive: disease.treatment.preventive ?? [],
        sustainableNote:
          disease.additionalNotes ||
          "Follow safe use of inputs and verify with your local agricultural extension officer.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clear = () => {
    setPreview(null)
    setFileName(null)
    setResult(null)
    setError(null)
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

        {error && (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10 py-2">
            <AlertTitle className="text-xs font-medium">Analysis failed</AlertTitle>
            <AlertDescription className="text-[11px]">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3 overflow-auto flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", severityColor[result.severity])}>
                {result.severity} risk
              </Badge>
              <span className="text-xs text-muted-foreground">
                Confidence: {result.confidence}%
              </span>
            </div>
            <p className="text-sm font-medium">{result.condition}</p>

            {result.immediate.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Immediate actions</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.immediate.map((item, index) => (
                    <li key={index} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.chemical.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pesticide / medicine suggestions</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.chemical.map((item, index) => (
                    <li key={index} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.organic.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Organic remedies</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.organic.map((item, index) => (
                    <li key={index} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.preventive.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Preventive measures</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {result.preventive.map((item, index) => (
                    <li key={index} className="flex gap-1.5">
                      <span className="text-primary">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Alert className="border-primary/20 bg-primary/5 py-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <AlertTitle className="text-xs font-medium">Sustainability</AlertTitle>
              <AlertDescription className="text-[11px]">
                {result.sustainableNote}
              </AlertDescription>
            </Alert>
            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              Analysis is AI-assisted. Confirm recommendations with your local agricultural extension before spraying chemicals.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
