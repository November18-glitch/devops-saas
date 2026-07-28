import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const token =
      req.headers.authorization?.replace("Bearer ", "");

    const {
      data: { user }
    } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      teamId,
      email,
      role = "member"
    } = req.body;

    if (!teamId || !email) {
      return res.status(400).json({
        error: "Missing fields"
      });
    }

    const { data: team } = await supabase
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single();

    if (!team) {
      return res.status(404).json({
        error: "Team not found"
      });
    }

    if (team.owner_id !== user.id) {
      return res.status(403).json({
        error: "Only owner can invite."
      });
    }

    const { data: owner } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if ((owner?.plan || "FREE") === "FREE") {

      const { count } = await supabase
  .from("team_members")
  .select("*", {
    count: "exact",
    head: true,
  })
  .eq("team_id", teamId);

      if (count >= 3) {
        return res.status(403).json({
          error: "Free plan allows only 3 members."
        });
      }
    }

    const inviteToken =
      crypto.randomUUID();

    const { error } =
      await supabase
        .from("team_invites")
        .insert({
          team_id: teamId,
          email,
          role,
          token: inviteToken,
          accepted: false,
          status: "pending"
        });

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    await fetch(
  `${req.headers.origin}/api/sendInviteEmail`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      token: inviteToken,
    }),
  }
);

    res.status(200).json({
      success: true,
      token: inviteToken
    });

  }

  catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

}