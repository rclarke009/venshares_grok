import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(1000),
});

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: limited.retryAfterSec },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
        },
      },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const url = process.env.CONTACT_FUNCTION_URL;
  const key = process.env.CONTACT_FORM_KEY;
  if (!url || !key) {
    console.error("MYDEBUG →", "Contact env missing: CONTACT_FUNCTION_URL or CONTACT_FORM_KEY");
    return NextResponse.json(
      { error: "Contact is not configured on the server." },
      { status: 503 },
    );
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Contact-Form-Key": key,
    },
    body: JSON.stringify({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      message: parsed.data.message,
    }),
  });

  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    /* plain text */
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        error: "Upstream error",
        details: data,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
