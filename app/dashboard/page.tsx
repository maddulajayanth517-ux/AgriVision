import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAuthToken, type AuthTokenPayload } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  const user = token ? verifyAuthToken(token) : null

  if (!user) {
    redirect("/")
  }

  return <DashboardLayout user={user as AuthTokenPayload} />
}
