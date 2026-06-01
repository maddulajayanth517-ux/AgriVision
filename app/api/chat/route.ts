import { streamText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { buildAISaathiSystemPrompt, type FarmContext } from "@/lib/ai-system-prompt"

function offlineSaathiReply(lastUserText: string, ctx: FarmContext): string {
  const crop = ctx.cropName ?? "your crop"
  const region = ctx.state ?? ctx.region ?? "your area"
  return `**Sustainability Guardian:** Namaste! AI Saathi is running in offline demo mode (add \`OPENAI_API_KEY\` to \`.env.local\` for full AI).

**Crop Planner:** For ${region}, in **${ctx.season ?? "current season"}**, popular choices include Rice, Cotton, Maize, Chilli, and Groundnut. Select your location on the map for tailored scores.

**Weather Expert:** Check the weather alerts card after setting your pincode — avoid spraying before heavy rain.

**Plant Doctor:** Upload a clear leaf photo in Plant Doctor for demo disease analysis.

**Soil Scientist:** For ${crop}: split urea in small doses; never exceed label MAX limits. Add FYM/compost each season.

Regarding your question: *"${lastUserText.slice(0, 200)}"* — visit your local KVK for field-specific advice, or enable the OpenAI API key for detailed AI Saathi answers.

⚠️ **Remember:** Overuse of water, urea, and pesticides damages soil health for future generations.`
}

function getLastUserText(messages: unknown[]): string {
  const msgs = messages as Array<{ role?: string; parts?: Array<{ type: string; text?: string }> }>
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role === "user" && msgs[i].parts) {
      return msgs[i].parts!
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("")
    }
  }
  return ""
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body.messages ?? []
    const context = (body.context ?? {}) as FarmContext
    const system = buildAISaathiSystemPrompt(context)

  if (!process.env.OPENAI_API_KEY) {
    const reply = offlineSaathiReply(getLastUserText(messages), context)
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: "text-start", id: "offline" })
        writer.write({ type: "text-delta", id: "offline", delta: reply })
        writer.write({ type: "text-end", id: "offline" })
      },
    })
    return createUIMessageStreamResponse({ stream })
  }

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[AI Saathi]", error)
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const msg =
          "**Sustainability Guardian:** Sorry, AI Saathi encountered an error. Please try again. If this persists, check your API key in `.env.local`."
        writer.write({ type: "text-start", id: "err" })
        writer.write({ type: "text-delta", id: "err", delta: msg })
        writer.write({ type: "text-end", id: "err" })
      },
    })
    return createUIMessageStreamResponse({ stream })
  }
}
