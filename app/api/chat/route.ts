import type { FarmContext } from "@/lib/ai-system-prompt"
import { buildAISaathiSystemPrompt } from "@/lib/ai-system-prompt"
import { resolveSearchQuery } from "@/lib/location-service"
import { openWeatherCurrent, openWeatherForecast } from "@/lib/api-helpers"
import { streamText, UIMessage, convertToModelMessages } from "ai"
import { groq } from "@ai-sdk/groq"

interface ChatRequestBody {
  messages: UIMessage[]
  context?: FarmContext
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody | null
  if (!body?.messages?.length) {
    return new Response(JSON.stringify({ error: "Messages are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const context = body.context
  const systemPrompt = buildAISaathiSystemPrompt(context)
  let weatherSummary = ""

  if (context?.pincode || context?.locationLabel) {
    try {
      const locationQuery = context.pincode ?? context.locationLabel ?? ""
      const location = await resolveSearchQuery(locationQuery)
      if (location) {
        const [current, forecast] = await Promise.all([
          openWeatherCurrent(location.lat, location.lng),
          openWeatherForecast(location.lat, location.lng),
        ])

        const dailyForecast = forecast.list.slice(0, 5)
          .map((item: any) => `${item.dt_txt}: ${Math.round(item.main.temp)}°C, ${item.weather[0]?.description}`)
          .join("; ")

        weatherSummary = `\nWEATHER CONTEXT:\n- Location: ${location.label}\n- Temperature: ${Math.round(current.main.temp)}°C\n- Condition: ${current.weather[0]?.description || "unknown"}\n- Humidity: ${current.main.humidity}%\n- Rain in last hour: ${current.rain?.["1h"] ?? 0}mm\n- Forecast preview: ${dailyForecast}`
      }
    } catch (error) {
      console.error("Weather enrichment failed:", error)
    }
  }

  if (!process.env.GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY for AI Saathi chat route")
    return new Response(JSON.stringify({ error: "AI key is not configured on the server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const modelMessages = await convertToModelMessages(body.messages)
  const modelId = process.env.GROQ_MODEL ?? "groq/compound-mini"
  const model = groq(modelId)
  const result = streamText({
    model,
    system: `${systemPrompt}\n${weatherSummary}`,
    messages: modelMessages,
    temperature: 0.7,
  })

  return result.toUIMessageStreamResponse()
}
