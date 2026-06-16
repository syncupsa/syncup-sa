// @deno-types="supabase" (for Supabase Edge runtime)
// Deno Edge Function for Supabase: Handles CORS, parses JSON, sends email via Resend API, returns JSON response
// POST expects: { name, email, message }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const TO_EMAIL = "strapp.co.za@gmail.com";
const FROM_EMAIL = "onboarding@resend.dev";

// --- Strict CORS ---
const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "https://strapp.co.za",
  "https://www.strapp.co.za",
];
function corsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : "none",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

// --- Simple in-memory rate limiting (per IP, resets on cold start) ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 requests per window
const ipHits: Record<string, { count: number; first: number }> = {};

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", field: "form" }), {
      status: 405,
      headers: corsHeaders(origin),
    });
  }

  // --- Rate limiting logic ---
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
  const now = Date.now();
  if (!ipHits[ip]) {
    ipHits[ip] = { count: 1, first: now };
  } else {
    if (now - ipHits[ip].first < RATE_LIMIT_WINDOW) {
      ipHits[ip].count++;
      if (ipHits[ip].count > RATE_LIMIT_MAX) {
        return new Response(
          JSON.stringify({
            error: "Too many requests. Please wait a minute before trying again.",
            field: "form",
          }),
          {
            status: 429,
            headers: corsHeaders(origin),
          },
        );
      }
    } else {
      ipHits[ip] = { count: 1, first: now };
    }
  }

  let body: { firstName?: string; businessName?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON", field: "form" }), {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  // Field-level validation
  const { firstName, businessName, email } = body;
  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "First name is required";
  if (!businessName) errors.businessName = "Business name is required";
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address";
  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ error: "Validation failed", fields: errors }), {
      status: 400,
      headers: corsHeaders(origin),
    });
  }

  // @ts-ignore Deno.env is available in Supabase Edge runtime
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY", field: "form" }), {
      status: 500,
      headers: corsHeaders(origin),
    });
  }

  // Prepare Resend API payload (seeded executive brief, no user message)
  const resendPayload = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `New Google Visibility Setup Request`,
    reply_to: email,
    text: `Name: ${firstName}\nBusiness: ${businessName}\nEmail: ${email}\n\nExecutive Brief:\nThe user has requested to set up their business for Google Visibility. Please reach out to them for next steps.`,
    html: `<b>Name:</b> ${firstName}<br/><b>Business:</b> ${businessName}<br/><b>Email:</b> ${email}<br/><b>Executive Brief:</b><br/>The user has requested to set up their business for Google Visibility. Please reach out to them for next steps.`,
  };

  // Send email via Resend
  let resendRes, resendData;
  try {
    resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });
    resendData = await resendRes.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: String(err), field: "form" }),
      {
        status: 502,
        headers: corsHeaders(origin),
      },
    );
  }

  if (!resendRes.ok) {
    return new Response(
      JSON.stringify({
        error: resendData?.message || "Resend API error",
        details: resendData,
        field: "form",
      }),
      {
        status: 502,
        headers: corsHeaders(origin),
      },
    );
  }

  return new Response(JSON.stringify({ success: true, message: "Email sent" }), {
    status: 200,
    headers: corsHeaders(origin),
  });
});
