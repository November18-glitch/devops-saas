/// <reference lib="deno.window" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {

    const { email, team_id } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const token = crypto.randomUUID()

    // save invite
    const { error } = await supabase
      .from("team_invites")
      .insert({
        email,
        team_id,
        token,
        accepted: false
      })

    if (error) {
      throw error
    }

    // send real email
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL")

    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/join?token=${token}`
    })

    const inviteLink = `${siteUrl}/join?token=${token}`

    return new Response(
      JSON.stringify({
        success: true,
        inviteLink
      }),
      { headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )

  }

})