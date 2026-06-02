import { aiChat } from "@/lib/api-helpers"
import { detectRegionFromCoords, detectRegionFromState } from "@/lib/region-logic"
import type { ResolvedLocation } from "@/lib/location-service"
import { geocodeWithNominatim } from "@/lib/location-service"

interface LocationRequestBody {
  query: string
}

interface AIParsedLocation {
  query: string
  pincode?: string
  lat?: number
  lng?: number
  label?: string
}

function extractJsonObject(text: string): string | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/m)
  return jsonMatch ? jsonMatch[0] : null
}

async function parseLocationQueryWithAI(input: string): Promise<AIParsedLocation | null> {
  try {
    if (!process.env.GROQ_API_KEY) return null

    const system = `You are a location parser for an agricultural dashboard in India. ` +
      `The user may enter a pincode, village, city, state, coordinates, or a loose location phrase. ` +
      `Return only valid JSON with keys: query, pincode (optional), lat (optional), lng (optional), label (optional). ` +
      `If the input contains coordinates, return lat and lng. If the input contains a pincode, return the pincode and a query that includes India. ` +
      `Do not return any explanation or markdown.`

    const user = `Parse this search input into structured location data: "${input.trim()}"`
    const res = await aiChat({
      model: process.env.GROQ_MODEL ?? "groq/compound-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 200,
      temperature: 0,
    })

    if (!res.ok) return null
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    const jsonText = extractJsonObject(content || "")
    if (!jsonText) return null

    return JSON.parse(jsonText) as AIParsedLocation
  } catch (error) {
    console.error("AI location parse error:", error)
    return null
  }
}

async function geocodeWithMapbox(query: string): Promise<ResolvedLocation | null> {
  const token = process.env.MAPBOX_SECRET_TOKEN
  if (!token) return null

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&country=in`
    )
    if (!res.ok) return null

    const data = await res.json()
    const feature = data?.features?.[0]
    if (!feature || !feature.center?.length) return null

    const region = detectRegionFromState(
      (feature.context || []).find((item: any) => item.id?.startsWith("region"))?.text || ""
    )

    return {
      lat: feature.center[1],
      lng: feature.center[0],
      label: feature.place_name,
      pincode: (feature.context || []).find((item: any) => item.id?.startsWith("postcode"))?.text || undefined,
      state: (feature.context || []).find((item: any) => item.id?.startsWith("region"))?.text || undefined,
      district: (feature.context || []).find((item: any) => item.id?.startsWith("district"))?.text || undefined,
      country: (feature.context || []).find((item: any) => item.id?.startsWith("country"))?.text || undefined,
      region: region || "Global",
    }
  } catch (error) {
    console.error("Mapbox geocode error:", error)
    return null
  }
}

function formatLocationResponse(location: ResolvedLocation) {
  return {
    success: true,
    location,
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as LocationRequestBody | null
  if (!body?.query?.trim()) {
    return new Response(JSON.stringify({ success: false, error: "Query is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const query = body.query.trim()

  // Try AI parsing first if a Groq key is configured.
  const aiParsed = await parseLocationQueryWithAI(query)

  if (aiParsed?.lat != null && aiParsed?.lng != null) {
    return new Response(JSON.stringify(formatLocationResponse({
      lat: aiParsed.lat,
      lng: aiParsed.lng,
      label: aiParsed.label || query,
      pincode: aiParsed.pincode,
      state: aiParsed.label ? undefined : undefined,
      district: undefined,
      country: undefined,
      region: detectRegionFromCoords(aiParsed.lat, aiParsed.lng, aiParsed.label),
    })), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const resolvedQuery = aiParsed?.query || query

  let location: ResolvedLocation | null = null

  // Prefer free OpenStreetMap / Nominatim lookup first.
  location = await geocodeWithNominatim(resolvedQuery)

  // If Nominatim fails and a Mapbox token exists, try Mapbox as an optional fallback.
  if (!location && process.env.MAPBOX_SECRET_TOKEN) {
    location = await geocodeWithMapbox(resolvedQuery)
  }

  if (!location) {
    return new Response(JSON.stringify({ success: false, error: "Unable to resolve location." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(formatLocationResponse(location)), {
    headers: { "Content-Type": "application/json" },
  })
}
