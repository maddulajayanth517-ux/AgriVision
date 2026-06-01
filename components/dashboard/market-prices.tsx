"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store, TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react"
import { getNearbyMandiPrices } from "@/lib/mandi-data"
import type { LocationData } from "@/lib/agri-types"
import type { CropProfile } from "@/lib/agri-types"

interface MarketPricesProps {
  location: LocationData | null
  crop: CropProfile | null
}

export function MarketPrices({ location, crop }: MarketPricesProps) {
  const prices = useMemo(() => {
    if (!location || !crop) return []
    return getNearbyMandiPrices(crop.name, location.lat, location.lng)
  }, [location, crop])

  if (!location || !crop) return null

  const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Store className="h-4 w-4 text-primary" />
          Mandi prices (within 200 km)
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Best sell: {crop.bestSellWindow} · {crop.mandiHint}
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="max-h-[160px]">
          <div className="space-y-2">
            {prices.map((p) => {
              const Trend = trendIcon[p.trend]
              return (
                <div
                  key={p.mandi}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-2.5 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{p.mandi}</p>
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" />
                      ~{p.distanceKm} km
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-primary">
                      ₹{p.pricePerQuintal.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">/quintal</p>
                    <Badge variant="outline" className="mt-0.5 h-4 gap-0.5 text-[9px] px-1">
                      <Trend className="h-2 w-2" />
                      {p.trend}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Indicative demo prices — verify on Agmarknet before selling.
        </p>
      </CardContent>
    </Card>
  )
}
