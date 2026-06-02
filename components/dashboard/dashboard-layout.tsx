"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { FarmMap, type LocationData } from "./farm-map"
import { CropHealthCards } from "./crop-health-cards"
import { Plant3DViewer } from "./plant-3d-viewer"
import { AIChatSidebar } from "./ai-chat-sidebar"
import { StatsCards } from "./stats-cards"
import { CropRecommendations } from "./crop-recommendations"
import { PlantDoctor } from "./plant-doctor"
import { DailyActionPlan } from "./daily-action-plan"
import { WeatherAlerts } from "./weather-alerts"
import { MarketPrices } from "./market-prices"
import { Tractor, Bell, X, MessageCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { CropRecommendation, IndianSeason } from "@/lib/agri-types"
import { getCurrentSeasonHint } from "@/lib/agri-types"

interface DashboardLayoutProps {
  user: {
    name?: string
    email: string
    phone?: string
    userId: string
  }
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null)
  const [activeSeason, setActiveSeason] = useState<IndianSeason>(getCurrentSeasonHint())
  const router = useRouter()

  const handleLocationChange = useCallback((location: LocationData | null) => {
    setCurrentLocation(location)
    if (!location) setSelectedCrop(null)
  }, [])

  const handleSelectCrop = useCallback((crop: CropRecommendation | null) => {
    setSelectedCrop(crop)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/")
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background lg:flex-row lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 border-b bg-background/90 px-4 py-3 backdrop-blur shadow-sm shadow-slate-900/5 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-slate-900 text-white shadow-lg shadow-emerald-500/20">
                <Tractor className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">AgriVision</h1>
                <p className="mt-1 text-sm text-slate-600">Smart farm assistant for weather, crop planning, and disease alert.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">Welcome back, {user.name ?? "Farmer"}</p>
                <p className="text-xs text-slate-500">Signed in as {user.email}</p>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <Button variant="ghost" size="icon" className="relative h-10 w-10" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-xs">किसान</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="mb-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-[2rem] bg-gradient-to-br from-emerald-600 via-slate-800 to-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">AI Saathi Dashboard</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Your farm, powered by insights.</h2>
              <p className="mt-4 max-w-2xl text-sm text-emerald-100/90 sm:text-base">
                AgriVision brings weather alerts, crop planning, disease diagnosis, and mandi pricing into a single, easy-to-use dashboard.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                  <p className="text-3xl font-semibold">{currentLocation?.pincode ?? "--"}</p>
                  <p className="mt-2 text-sm text-emerald-100/80">
                    {currentLocation ? currentLocation.label : "Search your farm location to begin."}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
                  <p className="text-3xl font-semibold">{selectedCrop?.name ?? "No crop selected"}</p>
                  <p className="mt-2 text-sm text-emerald-100/80">
                    {selectedCrop ? "Using crop-specific guidance" : "Pick a crop for tailored plans."}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Account</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">Farmer profile</h3>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{user.name ?? "Farmer"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="mt-4 rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">+{user.phone}</p>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Security</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">Session settings</h3>
              <p className="mt-3 text-sm text-slate-600">
                Your login session is protected with secure credentials. Use Remember Me to stay signed in for 30 days on this device.
              </p>
              <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-semibold">Fast access</p>
                <p className="mt-1">Keep your session active for 30 days when you choose Remember Me at login.</p>
              </div>
            </section>
          </div>

          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Aapka Khet</h2>
            <p className="mt-1 text-sm text-slate-500">
              Location · season · daily plan · disease check · mandi — all in one place
            </p>
          </div>

          <div className="mb-3 sm:mb-4">
            <StatsCards location={currentLocation} />
          </div>

          {currentLocation && (
            <div className="mb-3 sm:mb-4">
              <WeatherAlerts location={currentLocation} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4 lg:min-h-0">
            <div className="lg:col-span-7 min-h-[280px] sm:min-h-[320px] lg:min-h-[420px]">
              <FarmMap onLocationChange={handleLocationChange} />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3 min-h-[360px]">
              <Tabs defaultValue="recommendations" className="flex flex-col flex-1 min-h-[320px]">
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger value="recommendations" className="text-xs sm:text-sm">
                    Crop Planner
                  </TabsTrigger>
                  <TabsTrigger value="health" className="text-xs sm:text-sm">
                    Field Health
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="recommendations" className="mt-2 flex-1 min-h-[280px] data-[state=inactive]:hidden">
                  <CropRecommendations
                    location={currentLocation}
                    selectedCropId={selectedCrop?.id ?? null}
                    onSelectCrop={handleSelectCrop}
                    onSeasonChange={setActiveSeason}
                  />
                </TabsContent>
                <TabsContent value="health" className="mt-2 flex-1 min-h-[280px] data-[state=inactive]:hidden">
                  <CropHealthCards />
                </TabsContent>
              </Tabs>

              <div className="min-h-[200px] lg:min-h-[220px]">
                <Plant3DViewer
                  cropId={selectedCrop?.id}
                  cropName={selectedCrop?.name}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            <div className="min-h-[280px] sm:min-h-[320px]">
              <DailyActionPlan crop={selectedCrop} />
            </div>
            <div className="min-h-[280px] sm:min-h-[320px]">
              <PlantDoctor cropName={selectedCrop?.name} />
            </div>
            <div className="flex flex-col gap-3 min-h-[200px]">
              {selectedCrop && currentLocation && (
                <MarketPrices location={currentLocation} crop={selectedCrop} />
              )}
              {!selectedCrop && (
                <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground flex-1 flex items-center justify-center">
                  Select a crop above to see mandi prices within 200 km
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="hidden lg:flex lg:h-full lg:shrink-0">
        <AIChatSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedCropName={selectedCrop?.name}
          selectedCropId={selectedCrop?.id}
          locationLabel={currentLocation?.label}
          pincode={currentLocation?.pincode}
          state={currentLocation?.state}
          region={currentLocation?.region}
          season={activeSeason}
        />
      </div>

      <Sheet open={mobileChatOpen} onOpenChange={setMobileChatOpen}>
        <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">AI Saathi</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileChatOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <AIChatSidebar
              isCollapsed={false}
              onToggle={() => setMobileChatOpen(false)}
              selectedCropName={selectedCrop?.name}
              selectedCropId={selectedCrop?.id}
              locationLabel={currentLocation?.label}
              pincode={currentLocation?.pincode}
              state={currentLocation?.state}
              region={currentLocation?.region}
              season={activeSeason}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
