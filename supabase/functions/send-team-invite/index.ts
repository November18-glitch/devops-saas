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

    const { email, team_id, role } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const token = crypto.randomUUID()

    await supabase.from("team_invites").insert({
      email,
      team_id,
      role: role || "member",
      token,
      accepted: false
    })

    const siteUrl = Deno.env.get("PUBLIC_SITE_URL")

    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`
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