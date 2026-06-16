// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { firstName, businessName, email, message } = await req.json();

    // 1. Get Resend API Key from Env
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Server Configuration Error: Missing Resend API Key.");
    }

    // 2. Prepare the payload for Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sync Up Core Lead <onboarding@resend.dev>",
        to: ["syncup.co.za@gmail.com"],
        subject: `Strategic Inquiry: ${firstName} ${businessName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1a1a1a; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px; font-weight: 300;">New Strategic Inquiry Captured</h2>
            <p style="font-size: 15px;"><strong>Identity:</strong> ${firstName} — ${businessName}</p>
            <p style="font-size: 15px;"><strong>Direct Channel:</strong> ${email}</p>
            <div style="background: #fdfdfd; padding: 15px; border-left: 4px solid #000; margin-top: 20px;">
              <p style="font-weight: bold; margin-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666;">Executive Brief:</p>
              <p style="line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${message || "No additional details provided."}</p>
            </div>
            <p style="color: #aaa; font-size: 11px; margin-top: 40px; text-align: center;">
              Internal Document // sync up Operational Core (Durban)
            </p>
          </div>
        `,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.error("Resend API Error:", result);
      throw new Error(result.message || "Transmission failure at Resend.");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
