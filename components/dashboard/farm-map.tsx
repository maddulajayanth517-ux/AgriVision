"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, Navigation, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import type { LocationData } from "@/lib/agri-types"
import {
  resolveSearchQuery,
  toLocationData,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  LOCATION_ZOOM,
} from "@/lib/location-service"
import { getRegionLabel } from "@/lib/region-logic"

export type { LocationData }

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const MapHook = require("react-leaflet").useMap
  const map = MapHook()

  useEffect(() => {
    if (!center) return

    map.whenReady(() => {
      if (!map || !map.getContainer()) return
      map.flyTo(center, zoom, { duration: 1.5 })
    })
  }, [center, zoom, map])

  return null
}

interface FarmMapProps {
  onLocationChange?: (location: LocationData | null) => void
}

export function FarmMap({ onLocationChange }: FarmMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<LocationData | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [markerIcon, setMarkerIcon] = useState<L.Icon | null>(null)

  useEffect(() => {
    if (searchResult) onLocationChange?.(searchResult)
  }, [searchResult, onLocationChange])

  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      const L = require("leaflet")
      setMarkerIcon(
        new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      )
    }
  }, [])

  const resolveSearchLocation = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return null

    try {
      const response = await fetch("/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmed }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.location) {
          return data.location as LocationData
        }
      }
    } catch (error) {
      console.warn("AI location lookup failed, falling back to local search.", error)
    }

    const resolved = await resolveSearchQuery(trimmed)
    return resolved ? toLocationData(resolved) : null
  }, [])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchError(null)

    const resolved = await resolveSearchLocation(searchQuery)
    if (resolved) {
      setSearchResult(resolved)
      setMapCenter([resolved.lat, resolved.lng])
    } else {
      setSearchError(
        "Location not found. Try: 6-digit pincode (e.g. 500001), village name + Telangana, or lat, lng"
      )
    }
    setIsSearching(false)
  }, [resolveSearchLocation, searchQuery])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation not supported on this device")
      return
    }
    setIsSearching(true)
    setSearchError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        const resolved = await resolveSearchQuery(`${lat}, ${lng}`)
        const loc = resolved
          ? toLocationData(resolved)
          : { lat, lng, label: "Your current location" }
        setSearchResult(loc)
        setMapCenter([lat, lng])
        setIsSearching(false)
      },
      () => {
        setSearchError("Could not get GPS location. Allow permission or search manually.")
        setIsSearching(false)
      }
    )
  }

  return (
    <Card className="flex h-full flex-col border-primary/10">
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          Farm Location
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Pincode, village, or coordinates — optimised for Telangana, Andhra Pradesh &amp; India
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="e.g. 500001, Warangal, or 17.39, 78.49"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-9 pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="h-9 flex-1 sm:flex-none"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-1.5">Search</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={isSearching}
              className="h-9"
              title="Use GPS"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {searchError && <p className="text-xs text-destructive">{searchError}</p>}
        {searchResult && !searchError && (
          <p className="truncate text-xs text-muted-foreground">
            ✓ {searchResult.label}
            {searchResult.region && (
              <span className="ml-1 text-primary font-medium">· {getRegionLabel(searchResult.region)}</span>
            )}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-[240px] p-2">
        <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-lg">
          {isClient && (
            <>
              <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                crossOrigin=""
              />
              <MapContainer
                center={DEFAULT_MAP_CENTER}
                zoom={DEFAULT_MAP_ZOOM}
                className="h-full w-full rounded-lg z-0"
                style={{ background: "#1e3a2f", minHeight: 240 }}
              >
                <MapController center={mapCenter} zoom={LOCATION_ZOOM} />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {searchResult && markerIcon && (
                  <Marker position={[searchResult.lat, searchResult.lng]} icon={markerIcon}>
                    <Popup>
                      <div className="min-w-[140px] text-sm">
                        <p className="font-semibold">Your farm location</p>
                        <p className="text-xs text-muted-foreground mt-1">{searchResult.label}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
