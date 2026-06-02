import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto"

const ITERATIONS = 310000
const KEYLEN = 64
const DIGEST = "sha256"

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable")
  }
  return secret
}

function base64url(input: Buffer | string) {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : input
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function sign(content: string) {
  const secret = getSecret()
  return base64url(createHmac(DIGEST, secret).update(content).digest())
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const derived = pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString("hex")
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"))
  } catch {
    return false
  }
}

export interface AuthTokenPayload {
  userId: string
  email: string
  name?: string
  phone?: string
  exp: number
}

export function createAuthToken(payload: { userId: string; email: string; name?: string; phone?: string }) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const body: AuthTokenPayload = {
    ...payload,
    exp: now + 7 * 24 * 60 * 60,
  }
  const encoded = `${header}.${base64url(JSON.stringify(body))}`
  const signature = sign(encoded)
  return `${encoded}.${signature}`
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const signed = `${header}.${payload}`
    const expected = sign(signed)
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null

    const data = JSON.parse(Buffer.from(payload, "base64").toString("utf8")) as AuthTokenPayload
    if (typeof data.exp !== "number" || Math.floor(Date.now() / 1000) > data.exp) {
      return null
    }

    return data
  } catch {
    return null
  }
}
