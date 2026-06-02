import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Enter a valid email."),
  phone: z.string()
    .min(10, "Enter a valid phone number.")
    .max(15, "Enter a valid phone number.")
    .regex(/^[+]?\d+$/, "Phone number must contain only digits and optional leading +."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "")
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.errors[0]?.message ?? "Invalid input." }, { status: 400 })
  }

  const { name, email, phone, password } = result.data

  try {
    const { db } = await connectToDatabase()
    const normalizedEmail = email.toLowerCase()
    const normalizedPhone = normalizePhone(phone)

    const existing = await db.collection("farmers").findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "A user with that email or phone number already exists." }, { status: 409 })
    }

    const hashedPassword = hashPassword(password)
    await db.collection("farmers").insertOne({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
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
