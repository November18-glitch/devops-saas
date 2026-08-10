import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log("🔥🔥🔥 ACCEPT INVITE REACHED 🔥🔥🔥");
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);
  console.log(
    "AUTH:",
    req.headers.authorization ? "PRESENT" : "MISSING"
  );

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      method: req.method,
    });
  }

  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "");

    console.log(
      "TOKEN PRESENT:",
      !!token
    );

    if (!token) {
      return res.status(401).json({
        error: "Missing authorization token",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    console.log(
      "AUTH USER:",
      user?.id || null
    );

    console.log(
      "AUTH EMAIL:",
      user?.email || null
    );

    if (userError) {
      console.error(
        "AUTH ERROR:",
        userError
      );

      return res.status(401).json({
        error: userError.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { inviteToken } =
      req.body || {};

    console.log(
      "INVITE TOKEN PRESENT:",
      !!inviteToken
    );

    if (!inviteToken) {
      return res.status(400).json({
        error: "Missing inviteToken",
      });
    }

    const {
      data: invite,
      error: inviteError,
    } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", inviteToken)
      .single();

    console.log(
      "INVITE:",
      invite
        ? {
            id: invite.id,
            team_id: invite.team_id,
            email: invite.email,
            role: invite.role,
            accepted: invite.accepted,
            status: invite.status,
          }
        : null
    );

    if (inviteError) {
      console.error(
        "INVITE LOOKUP ERROR:",
        inviteError
      );
    }

    if (!invite) {
      return res.status(404).json({
        error: "Invite not found",
      });
    }

    if (invite.accepted) {
      return res.status(400).json({
        error: "Invite already accepted",
      });
    }

    if (
      invite.email?.toLowerCase() !==
      user.email?.toLowerCase()
    ) {
      console.log(
        "EMAIL MISMATCH:",
        invite.email,
        user.email
      );

      return res.status(403).json({
        error: "Wrong account",
      });
    }

    const {
      data: existing,
      error: existingError,
    } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    console.log(
      "EXISTING MEMBER:",
      existing
    );

    if (existingError) {
      console.error(
        "EXISTING MEMBER ERROR:",
        existingError
      );

      return res.status(500).json({
        error:
          existingError.message,
      });
    }

    let member = existing;

    if (!member) {
      console.log(
        "INSERTING TEAM MEMBER..."
      );

      const {
        data,
        error: memberError,
      } = await supabase
        .from("team_members")
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          email: user.email,
          role: invite.role || "member",
          status: "active",
        })
        .select()
        .single();

      if (memberError) {
        console.error(
          "MEMBER INSERT ERROR:",
          memberError
        );

        return res.status(500).json({
          error:
            memberError.message,
        });
      }

      member = data;

      console.log(
        "✅ MEMBER CREATED:",
        member
      );
    }

    console.log(
      "MARKING INVITE ACCEPTED..."
    );

    const {
      error: updateError,
    } = await supabase
      .from("team_invites")
      .update({
        accepted: true,
        status: "accepted",
      })
      .eq("id", invite.id);

    if (updateError) {
      console.error(
        "INVITE UPDATE ERROR:",
        updateError
      );

      return res.status(500).json({
        error:
          updateError.message,
      });
    }

    console.log(
      "🎉 INVITE ACCEPTED SUCCESSFULLY"
    );

    return res.status(200).json({
      success: true,
      teamId: invite.team_id,
      memberId: member.id,
      inviteId: invite.id,
    });

  } catch (err) {
    console.error(
      "🔥 ACCEPT INVITE CRASH:",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Failed to accept invitation",
    });
  }
}