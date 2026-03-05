/// <reference lib="deno.window" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    const { email, team_id, role } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const token = crypto.randomUUID()

    // save invite
    await supabase.from("team_invites").insert({
      email,
      team_id,
      role,
      token
    })

    const inviteLink = `${Deno.env.get("PUBLIC_SITE_URL")}/join?token=${token}`

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "DeployAlly <onboarding@resend.dev>",
        to: email,
        subject: "You were invited to a team",
        html: `
          <h2>You were invited to a team</h2>
          <p>Click below to join:</p>
          <a href="${inviteLink}">${inviteLink}</a>
        `
      })
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )

  }

})