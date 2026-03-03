/// <reference lib="deno.window" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { email, team_id, role } = await req.json();

    if (!email || !team_id) {
      return new Response(JSON.stringify({ error: "Missing email or team_id" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // client using user's JWT
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (user.email === email) {
      return new Response(JSON.stringify({ error: "You cannot invite yourself" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // check if owner
    const { data: owner } = await supabaseAdmin
      .from("team_members")
      .select("id")
      .eq("team_id", team_id)
      .eq("user_id", user.id)
      .eq("role", "owner")
      .single();

    if (!owner) {
      return new Response(JSON.stringify({ error: "Not team owner" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    // prevent duplicate invites
    const { data: existingInvite } = await supabaseAdmin
      .from("team_invites")
      .select("id")
      .eq("team_id", team_id)
      .eq("email", email)
      .eq("accepted", false)
      .maybeSingle();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: "Already invited" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // insert invite
    await supabaseAdmin.from("team_invites").insert({
      team_id,
      email,
      role: role ?? "member",
      accepted: false,
    });

    // send invite email
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get("PUBLIC_SITE_URL")}/dashboard`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});