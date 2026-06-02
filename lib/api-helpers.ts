// lib/api-helpers.ts
export function errorResponse(message: string, status = 500) {
  return Response.json({ success: false, error: message }, { status });
}

export function successResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}

export function stripDataUrl(dataUrl: string): string {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

export function requireEnv(...keys: string[]): void {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) throw new Error(`Missing env: ${missing.join(", ")}`);
}

const hits = new Map();

export function rateLimit(key: string, max = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function parseBody<T = any>(req: Request): Promise<T | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function getGroqBaseUrl() {
  return (process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, "")
}

export async function aiChat(payload: any): Promise<Response> {
  requireEnv("GROQ_API_KEY")
  return fetch(`${getGroqBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function openWeatherCurrent(lat: number, lon: number) {
  requireEnv("OPENWEATHER_API_KEY");
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("Weather error");
  return res.json();
}

export async function openWeatherForecast(lat: number, lon: number) {
  requireEnv("OPENWEATHER_API_KEY");
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );
  if (!res.ok) throw new Error("Forecast error");
  return res.json();
}