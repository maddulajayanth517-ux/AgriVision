"use client"

import { useState, useCallback } from "react"
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
import { Tractor, Bell, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { CropRecommendation, IndianSeason } from "@/lib/agri-types"
import { getCurrentSeasonHint } from "@/lib/agri-types"

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null)
  const [activeSeason, setActiveSeason] = useState<IndianSeason>(getCurrentSeasonHint())

  const handleLocationChange = useCallback((location: LocationData | null) => {
    setCurrentLocation(location)
    if (!location) setSelectedCrop(null)
  }, [])

  const handleSelectCrop = useCallback((crop: CropRecommendation | null) => {
    setSelectedCrop(crop)
  }, [])

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background lg:flex-row lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none sm:text-lg">AgriVision</h1>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                AI Saathi · Sustainable Farming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 lg:hidden h-9"
              onClick={() => setMobileChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">AI Saathi</span>
            </Button>
            <Avatar className="hidden h-8 w-8 sm:flex">
              <AvatarFallback className="bg-primary/10 text-xs">किसान</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg font-semibold sm:text-xl">Aapka Khet</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
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
