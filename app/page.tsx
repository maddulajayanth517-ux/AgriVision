"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "login" | "register"

export default function Page() {
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: mode === "register" ? name : undefined,
          email,
          phone,
          password,
          rememberMe: mode === "login" ? rememberMe : undefined,
        }),
      })
      const data = await response.json()

      if (!data.success) {
        setMessage(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      if (mode === "register") {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, phone, password }),
        })
        const loginData = await loginRes.json()
        if (!loginData.success) {
          setMessage(loginData.error || "Registered, but login failed. Please sign in.")
          setMode("login")
          setLoading(false)
          return
        }
      }

      router.push("/dashboard")
    } catch (error) {
      setMessage("Unable to connect. Please try again later.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#e2e8f0_100%)] px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-slate-900 to-slate-950 p-10 text-white sm:p-12">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_58%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-200">
                Farmer Portal
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                AgriVision Secure Login
              </h1>
              <p className="max-w-lg text-sm leading-7 text-emerald-100/90">
                Sign in with your email, phone number, and password to reach your personalized farm dashboard. Keep your fields, weather, mandi updates, and AI Saathi advice in a single secure space.
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/10">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Why choose AgriVision?</p>
              <ul className="mt-4 space-y-3 text-sm text-emerald-100/85">
                <li>• Strong account protection using a secure farmer profile.</li>
                <li>• Phone and email verification ready for trusted access.</li>
                <li>• Farm insights, weather alerts, and crop recommendations in one place.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mb-8 flex flex-col gap-3 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">AgriVision Farmer Account</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {mode === "login" ? "Access your farm dashboard" : "Register a new farmer account"}
            </h2>
            <p className="max-w-xl text-sm text-slate-600">
              {mode === "login"
                ? "Enter your registered email, phone, and password to continue."
                : "Create an account using your name, email, phone number, and a secure password."}
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Button
              variant={mode === "login" ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setMode("login")
                setMessage(null)
              }}
              type="button"
            >
              Login
            </Button>
            <Button
              variant={mode === "register" ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setMode("register")
                setMessage(null)
              }}
              type="button"
            >
              Register
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center gap-3">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-600">
                  Remember me for 30 days
                </label>
              </div>
            )}

            {message && <p className="text-sm text-destructive">{message}</p>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Processing…" : mode === "login" ? "Sign in" : "Create account"}
              </Button>
              <p className="text-xs text-slate-500">
                {mode === "login"
                  ? "New farmer? Register now and unlock user-specific farm insights."
                  : "Already have an account? Switch to login."}
              </p>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
