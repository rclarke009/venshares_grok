import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZEPTOMAIL_URL = Deno.env.get("ZEPTOMAIL_URL") ?? "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_TOKEN = Deno.env.get("ZEPTOMAIL_TOKEN");
const CONTACT_FORM_KEY = Deno.env.get("CONTACT_FORM_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CORS_ORIGIN =
  Deno.env.get("CONTACT_CORS_ORIGIN") ?? "https://www.venshares.com";

function corsHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Contact-Form-Key",
    "Access-Control-Max-Age": "86400",
    ...extra,
  };
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "MYDEBUG →",
    "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for Edge Function",
  );
}

const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitize = (input: string) =>
  input.replace(/[&<>"']/g, (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[m]!,
  );

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  }

  try {
    const providedKey = req.headers.get("X-Contact-Form-Key");
    if (!CONTACT_FORM_KEY || providedKey !== CONTACT_FORM_KEY) {
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders({ "Content-Type": "application/json" }),
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase URL or service role key is not configured for this function");
    }

    const ipAddress = req.headers.get("X-Forwarded-For") || "unknown";

    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    await supabase.from("rate_limits").delete().lt("timestamp", windowStart.toISOString());

    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact" })
      .eq("ip_address", ipAddress)
      .gte("timestamp", windowStart.toISOString());

    if (countError) {
      console.error("Rate limit check error:", countError);
      throw new Error("Internal server error");
    }

    if (count !== null && count >= MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: "Too many requests, please try again later" }), {
        status: 429,
        headers: corsHeaders({ "Content-Type": "application/json" }),
      });
    }

    await supabase.from("rate_limits").insert({ ip_address: ipAddress });

    const body = await req.text();
    let { email, name, message } = JSON.parse(body || "{}");

    if (!email || !name || !message) {
      throw new Error("Missing email, name, or message");
    }
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
    if (name.length > 100 || message.length > 1000) {
      throw new Error("Name or message too long");
    }

    email = email.trim().toLowerCase();
    name = sanitize(name.trim());
    message = sanitize(message.trim());

    if (!ZEPTOMAIL_TOKEN) {
      throw new Error("ZEPTOMAIL_TOKEN is not set");
    }

    const response = await fetch(ZEPTOMAIL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Zoho-enczapikey ${ZEPTOMAIL_TOKEN}`,
      },
      body: JSON.stringify({
        from: { address: "rivkaclarke@venshares.com", name: "Venshares Contact" },
        to: [{ email_address: { address: email, name } }],
        subject: "Contact Form Submission - VenShares",
        htmlbody: `
          <h1>Hello ${name},</h1>
          <p>Thank you for contacting VenShares!</p>
          <p><strong>Your Message:</strong> ${message}</p>
          <p>We will respond to you soon.</p>
        `,
        track_clicks: true,
        track_opens: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ZeptoMail API error: ${JSON.stringify(errorData)}`);
    }

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 400,
        headers: corsHeaders({ "Content-Type": "application/json" }),
      },
    );
  }
});
