import { NextRequest } from "next/server"
import {
  errorResponse,
  successResponse,
  stripDataUrl,
  parseBody,
  rateLimit,
  aiChat,
} from "@/lib/api-helpers"

interface RequestBody {
  image: string
  cropType?: string
  additionalContext?: string
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local"
  if (!rateLimit(`disease:${ip}`, 20, 60_000)) {
    return errorResponse("Rate limit exceeded. Please wait a moment.", 429)
  }

  const body = await parseBody<RequestBody>(req)
  if (!body?.image) {
    return errorResponse("Request body must include an `image` field.", 400)
  }

  const base64Image = stripDataUrl(body.image)
  const cropHint = body.cropType ? `Crop type: ${body.cropType}.` : ""
  const contextHint = body.additionalContext ? `Additional context: ${body.additionalContext}` : ""

  try {
    const aiRes = await aiChat({
      model: "gpt-4o",
      max_tokens: 1000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert plant pathologist for Indian agriculture. Return ONLY valid JSON with the requested schema. Answer in a practical, farmer-friendly way and always include pesticide or medicine recommendations where appropriate.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            {
              type: "text",
              text: `Diagnose the plant from the image. ${cropHint} ${contextHint} Identify the likely disease or pest, affected plant part, symptoms, causes, spread risk, and suggest immediate actions, pesticide/chemical remedies, organic alternatives, and preventive measures. Use practical terms for smallholder farmers.`.trim(),
            },
          ],
        },
      ],
    })

    if (!aiRes.ok) {
      const err = await aiRes.text()
      console.error("Disease detection error:", err)
      return errorResponse("AI service unavailable. Please try again.", 502)
    }

    const data = await aiRes.json()
    const raw = data.choices?.[0]?.message?.content
    if (!raw) {
      return errorResponse("No response from AI model.", 502)
    }

    const parseJson = (value: unknown) => {
      if (!value) return null
      if (typeof value === "object") return value

      if (typeof value === "string") {
        const trimmed = value.trim()
        try {
          return JSON.parse(trimmed)
        } catch {
          const match = trimmed.match(/\{[\s\S]*\}$/)
          if (match) {
            return JSON.parse(match[0])
          }
        }
      }

      return null
    }

    const result = parseJson(raw)
    if (!result) {
      console.error("Unable to parse AI disease response:", raw)
      return errorResponse("AI analysis returned invalid JSON.", 502)
    }

    return successResponse({ result, analyzedAt: new Date().toISOString(), model: "gpt-4o" })
  } catch (err) {
    console.error("Disease detection error:", err)
    return errorResponse("Failed to analyze image. Please try again.")
  }
}
