import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyPassword, createAuthToken } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  phone: z.string()
    .min(10, "Enter a valid phone number.")
    .max(15, "Enter a valid phone number.")
    .regex(/^[+]?\d+$/, "Phone number must contain only digits and optional leading +."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional(),
})

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "")
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.errors[0]?.message ?? "Invalid credentials." }, { status: 400 })
  }

  const { email, phone, password, rememberMe } = result.data

  try {
    const { db } = await connectToDatabase()
    const normalizedEmail = email.toLowerCase()
    const normalizedPhone = normalizePhone(phone)

  const user = await db.collection("farmers").findOne<{ _id: { toString: () => string }; name: string; email: string; phone: string; password: string }>({
    email: normalizedEmail,
    phone: normalizedPhone,
  })

  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ success: false, error: "Invalid email, phone, or password." }, { status: 401 })
  }

    const token = createAuthToken({ userId: user._id.toString(), email: user.email, name: user.name, phone: user.phone })
    const response = NextResponse.json({ success: true })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to connect to the database.",
      },
      { status: 500 }
    )
  }
}
