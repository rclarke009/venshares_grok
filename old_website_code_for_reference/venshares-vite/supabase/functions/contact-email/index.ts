import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ZEPTO_API_KEY = Deno.env.get("ZEPTO_API_KEY")!;
const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM_EMAIL = "rivakclarke@venshares.com"; // Use your verified sender

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.venshares.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { name, email, message } = await req.json();

  // Validate input
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "All fields required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Prepare email content
  const htmlBody = `
    <p>You have received a new message.</p>
    <p><b>Name:</b> ${name}<br>
    <b>Email:</b> ${email}<br>
    <b>Message:</b><br>${message}</p>
  `;
  const textBody = `You have received a new message.\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`;

  try {
    const res = await fetch(ZEPTO_ENDPOINT, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": ZEPTO_API_KEY,
      },
      body: JSON.stringify({
        from: { address: FROM_EMAIL },
        to: [{ email_address: { address: email, name: name } }],
        subject: `Contact form submission: ${name}`,
        textbody: textBody,
        htmlbody: htmlBody,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("ZeptoMail API error:", errorData);
      throw new Error(`ZeptoMail API error: ${res.statusText}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ZeptoMail error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: err.message ?? err }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});