/// <reference lib="deno.window" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    // Parse body
    const { email, team_id } = await req.json()

    if (!email || !team_id) {
      return new Response(
        JSON.stringify({ error: "Missing email or team_id" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Generate token
    const token = crypto.randomUUID()

    // Insert invite
    const { error: insertError } = await supabase
      .from("team_invites")
      .insert({
        email: email,
        team_id: team_id,
        token: token,
        accepted: false
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Generate invite link
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:5173"

    const inviteLink = `${siteUrl}/join?token=${token}`

    return new Response(
      JSON.stringify({
        success: true,
        inviteLink: inviteLink
      }),
      { headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({
        error: err.message
      }),
      { status: 500, headers: corsHeaders }
    )

  }

})