// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
//import "jsr:@supabase/functions-js/edge-runtime.d.ts"

//console.log("Hello from Functions!")

//Deno.serve(async (req) => {
//  const { name } = await req.json()
//  const data = {
//    message: `Hello ${name}!`,
//  }

//  return new Response(
//    JSON.stringify(data),
//    { headers: { "Content-Type": "application/json" } },
//  )
//})
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ZEPTOMAIL_URL = Deno.env.get("ZEPTOMAIL_URL") || "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_TOKEN = Deno.env.get("ZEPTOMAIL_TOKEN");
const CONTACT_FORM_KEY = Deno.env.get("CONTACT_FORM_KEY");
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitize = (input: string) => input.replace(/[&<>"']/g, (m) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[m]));

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://www.venshares.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Contact-Form-Key",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "https://www.venshares.com",
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const providedKey = req.headers.get("X-Contact-Form-Key");
    if (!CONTACT_FORM_KEY || providedKey !== CONTACT_FORM_KEY) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "https://www.venshares.com",
          "Content-Type": "application/json",
        },
      });
    }

    // Get client IP (approximate)
    const ipAddress = req.headers.get("X-Forwarded-For") || "unknown";

    // Check rate limit
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

    await supabase
      .from("rate_limits")
      .delete()
      .lt("timestamp", windowStart.toISOString());

    const { count, error: countError } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact" })
      .eq("ip_address", ipAddress)
      .gte("timestamp", windowStart.toISOString());

    if (countError) {
      console.error("Rate limit check error:", countError);
      throw new Error("Internal server error");
    }

    if (count >= MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: "Too many requests, please try again later" }), {
        status: 429,
        headers: {
          "Access-Control-Allow-Origin": "https://www.venshares.com",
          "Content-Type": "application/json",
        },
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
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.venshares.com",
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email", details: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.venshares.com",
      },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
