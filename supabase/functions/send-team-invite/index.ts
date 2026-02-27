/// <reference lib="deno.window" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
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

    // Validate logged-in user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid JWT" }), {
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

    // Admin client (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user is owner
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

    // Prevent duplicate invite
    const { data: existingInvite } = await supabaseAdmin
      .from("team_invites")
      .select("id")
      .eq("team_id", team_id)
      .eq("email", email)
      .eq("accepted", false)
      .maybeSingle();

    if (existingInvite) {
      return new Response(JSON.stringify({ error: "User already invited" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Generate token
    const token = crypto.randomUUID();

    // Insert invite row
    await supabaseAdmin.from("team_invites").insert({
      team_id,
      email,
      role: role ?? "member",
      token,
      accepted: false,
    });

    // Send Supabase invite email
    const siteUrl = Deno.env.get("PUBLIC_SITE_URL");

    const { error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?token=${token}&team_id=${team_id}`,
      });

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: corsHeaders,
      });
    }

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