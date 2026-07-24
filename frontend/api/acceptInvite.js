import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { inviteToken } = req.body;

    const { data: invite, error: inviteError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", inviteToken)
      .single();

    if (inviteError || !invite) {
      return res.status(404).json({
        error: "Invite not found",
      });
    }

    if (invite.accepted) {
      return res.status(400).json({
        error: "Invite already accepted",
      });
    }

    if (invite.email !== user.email) {
      return res.status(403).json({
        error: "Wrong account",
      });
    }

    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from("team_members")
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          email: user.email,
          role: invite.role,
          status: "active",
        });

      if (error) {
        return res.status(500).json(error);
      }
    }

    await supabase
      .from("team_invites")
      .update({
        accepted: true,
        status: "accepted",
      })
      .eq("id", invite.id);

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}