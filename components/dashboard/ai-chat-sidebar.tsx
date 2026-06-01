"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { FarmContext } from "@/lib/ai-system-prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Send,
  User,
  Sparkles,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  CloudSun,
  Shield,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"

const EXPERTS = [
  { id: "planner", icon: Leaf, label: "Crop Planner" },
  { id: "doctor", icon: Stethoscope, label: "Plant Doctor" },
  { id: "soil", icon: FlaskConical, label: "Soil Scientist" },
  { id: "weather", icon: CloudSun, label: "Weather Expert" },
  { id: "guardian", icon: Shield, label: "Sustainability" },
]

const suggestedPrompts = [
  { icon: Leaf, text: "Kharif crop for Telangana red soil with less water?" },
  { icon: Droplets, text: "How much water per acre for cotton today — max limit?" },
  { icon: Shield, text: "Why is overuse of urea bad for my children's soil?" },
  { icon: CloudSun, text: "Should I irrigate before tomorrow's rain?" },
  { icon: Stethoscope, text: "Yellow spots on rice leaves in Warangal — what to do?" },
]

interface AIChatSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  selectedCropName?: string
  selectedCropId?: string
  locationLabel?: string
  pincode?: string
  state?: string
  region?: string
  season?: string
}

export function AIChatSidebar({
  isCollapsed,
  onToggle,
  selectedCropName,
  selectedCropId,
  locationLabel,
  pincode,
  state,
  region,
  season,
}: AIChatSidebarProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const farmContext = useMemo<FarmContext>(
    () => ({
      cropName: selectedCropName,
      cropId: selectedCropId,
      locationLabel,
      pincode,
      state,
      region: region as FarmContext["region"],
      season,
    }),
    [selectedCropName, selectedCropId, locationLabel, pincode, state, region, season]
  )

  const contextRef = useRef(farmContext)
  contextRef.current = farmContext

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, id }) => ({
        body: { messages, id, context: contextRef.current },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestion = (text: string) => {
    if (isLoading) return
    sendMessage({ text })
  }

  function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
    if (!message.parts?.length) return ""
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
  }

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 shrink-0 flex-col items-center border-l border-sidebar-border bg-sidebar py-4">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Open AI Saathi">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Bot className="mt-4 h-5 w-5 text-sidebar-primary" />
        <span className="mt-2 text-[10px] font-medium [writing-mode:vertical-rl] text-sidebar-foreground">
          AI Saathi
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full max-w-sm shrink-0 flex-col border-l border-sidebar-border bg-sidebar sm:w-80 lg:w-96">
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/25">
            <Bot className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-sidebar-foreground">AI Saathi</h3>
            <p className="truncate text-[10px] text-sidebar-foreground/70">5 experts · sustainable farming</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-sidebar-border px-2 py-2">
        {EXPERTS.map((e) => (
          <Badge key={e.id} variant="secondary" className="h-5 gap-0.5 px-1.5 text-[9px] font-normal">
            <e.icon className="h-2.5 w-2.5" />
            {e.label.split(" ")[0]}
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <Sparkles className="mb-2 h-8 w-8 text-sidebar-primary" />
            <h4 className="text-sm font-semibold text-sidebar-foreground">Kisan ke liye AI Saathi</h4>
            <p className="mb-3 mt-1 px-2 text-[11px] text-sidebar-foreground/70">
              Crop, weather, soil, pests — with warnings against overuse of water &amp; chemicals.
            </p>
            {(locationLabel || selectedCropName) && (
              <div className="mb-3 flex flex-wrap justify-center gap-1">
                {locationLabel && (
                  <Badge variant="outline" className="text-[9px] max-w-full truncate">
                    📍 {locationLabel.slice(0, 40)}
                  </Badge>
                )}
                {selectedCropName && (
                  <Badge className="text-[9px] bg-sidebar-primary/30">{selectedCropName}</Badge>
                )}
              </div>
            )}
            <div className="flex w-full flex-col gap-1.5">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestion(p.text)}
                  className="flex items-start gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-2 text-left text-[11px] hover:bg-sidebar-accent"
                >
                  <p.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-2", message.role === "user" ? "flex-row-reverse" : "")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    message.role === "user" ? "bg-sidebar-primary" : "bg-sidebar-accent"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
                  ) : (
                    <Bot className="h-3.5 w-3.5" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[88%] rounded-lg px-2.5 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  {getMessageText(message) || (
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="mt-2 text-[10px] text-red-400">
            Connection error. AI Saathi will retry — or check .env.local for OPENAI_API_KEY.
          </p>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t border-sidebar-border p-2 sm:p-3">
        <div className="flex gap-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Puchho AI Saathi se..."
            className="h-9 flex-1 border-sidebar-border bg-sidebar-accent text-xs"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
