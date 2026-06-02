import { NextRequest } from "next/server"
import { errorResponse, successResponse, aiChat, openWeatherForecast } from "@/lib/api-helpers"

interface ForecastResponse {
  daily?: {
    time?: string[]
    precipitation_sum?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    weathercode?: number[]
  }
}

interface WeatherAlertItem {
  id: string
  severity: "info" | "warning" | "critical"
  title: string
  message: string
  advice: string
}

interface WeatherApiResult {
  summary?: string
  alerts: WeatherAlertItem[]
}

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat")
  const lng = req.nextUrl.searchParams.get("lng")
  const cropType = req.nextUrl.searchParams.get("cropType") ?? "general crop"

  if (!lat || !lng) {
    return errorResponse("Missing latitude or longitude.", 400)
  }

  try {
    const useOpenWeather = Boolean(process.env.OPENWEATHER_API_KEY)
    let forecastText = ""

    if (useOpenWeather) {
      const openWeather = await openWeatherForecast(Number(lat), Number(lng))
      const dailyMap = new Map<string, { max: number; min: number; prec: number; weather: string[] }>()

      for (const item of openWeather.list ?? []) {
        const date = new Date(item.dt * 1000).toISOString().slice(0, 10)
        const temp = item.main?.temp ?? 0
        const rain = item.rain?.["3h"] ?? 0
        const weatherLabel = item.weather?.[0]?.description ?? ""

        const existing = dailyMap.get(date) ?? { max: -Infinity, min: Infinity, prec: 0, weather: [] }
        existing.max = Math.max(existing.max, temp)
        existing.min = Math.min(existing.min, temp)
        existing.prec += rain
        if (weatherLabel) existing.weather.push(weatherLabel)
        dailyMap.set(date, existing)
      }

      const daily = Array.from(dailyMap.entries()).slice(0, 7)
      if (!daily.length) {
        throw new Error("Unable to parse OpenWeather data")
      }

      forecastText = daily
        .map(
          ([date, value]) =>
            `${date}: max ${value.max.toFixed(1)}°C, min ${value.min.toFixed(1)}°C, rain ${value.prec.toFixed(1)} mm, conditions ${[
              ...new Set(value.weather),
            ].join("/")}`
        )
        .join("\n")
    } else {
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weathercode&forecast_days=7&timezone=auto`
      )
      if (!forecastRes.ok) {
        throw new Error("Forecast provider error")
      }

      const forecast: ForecastResponse = await forecastRes.json()
      const daily = forecast.daily
      if (!daily?.time?.length) {
        return errorResponse("Unable to fetch forecast data.", 502)
      }

      forecastText = `Dates: ${daily.time.join(", ")}\nMax temp: ${daily.temperature_2m_max?.join(", ")}\nMin temp: ${daily.temperature_2m_min?.join(", ")}\nPrecipitation (mm): ${daily.precipitation_sum?.join(", ")}\nWeather code: ${daily.weathercode?.join(", ")}`
    }

    const payload = {
      model: process.env.GROQ_MODEL ?? "groq/compound-mini",
      max_tokens: 550,
      messages: [
        {
          role: "system",
          content:
            "You are a practical weather advisor for farmers in India. Analyze 7-day agricultural forecast data and return only JSON. Use the schema exactly."
        },
        {
          role: "user",
          content: `Forecast for ${cropType} at lat=${lat}, lng=${lng}:\n\n${forecastText}\n\nProvide alerts for heavy rain, drought, heat stress, and crop risk. Return JSON with keys: summary, alerts. Each alert must have id, severity, title, message, advice. Do not return any markdown formatting.`,
        },
      ],
      response_format: {
        type: "json_object",
      },
    }

    const aiRes = await aiChat(payload)
    if (!aiRes.ok) {
      const err = await aiRes.text()
      console.error("Weather alert AI error:", err)
      return errorResponse("AI service unavailable. Please try again.", 502)
    }

    const data = await aiRes.json()
    const raw = data.choices?.[0]?.message?.content
    if (!raw) {
      return errorResponse("No response from AI model.", 502)
    }

    const result = JSON.parse(raw) as WeatherApiResult
    if (!result.alerts || !Array.isArray(result.alerts)) {
      return errorResponse("Invalid AI response format.", 502)
    }

    return successResponse({ result })
  } catch (err) {
    console.error("Weather alert route error:", err)
    return errorResponse("Failed to generate weather alerts.")
  }
}
