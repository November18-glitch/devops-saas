import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // -----------------------------------
    // 1. GET LOGGED-IN USER
    // -----------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Missing authorization token",
      });
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    if (!accessToken) {
      return res.status(401).json({
        error: "Missing access token",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    console.log("ACCEPT INVITE USER:", {
      id: user.id,
      email: user.email,
    });

    // -----------------------------------
    // 2. GET INVITE TOKEN
    // -----------------------------------

    const { inviteToken } = req.body || {};

    if (!inviteToken) {
      return res.status(400).json({
        error: "Missing invite token",
      });
    }

    console.log("ACCEPT INVITE TOKEN:", inviteToken);

    // -----------------------------------
    // 3. FIND INVITATION
    // -----------------------------------

    const {
      data: invite,
      error: inviteError,
    } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", inviteToken)
      .maybeSingle();

    if (inviteError) {
      console.error("INVITE LOOKUP ERROR:", inviteError);

      return res.status(500).json({
        error: "Failed to find invitation",
        details: inviteError.message,
      });
    }

    if (!invite) {
      return res.status(404).json({
        error: "Invitation not found or invalid",
      });
    }

    console.log("INVITE FOUND:", {
      id: invite.id,
      team_id: invite.team_id,
      email: invite.email,
      role: invite.role,
      accepted: invite.accepted,
      status: invite.status,
    });

    // -----------------------------------
    // 4. CHECK INVITE STATUS
    // -----------------------------------

    if (invite.accepted === true || invite.status === "accepted") {
      return res.status(400).json({
        error: "Invitation already accepted",
      });
    }

    // -----------------------------------
    // 5. VERIFY EMAIL
    // -----------------------------------

    const inviteEmail =
      (invite.email || "").trim().toLowerCase();

    const userEmail =
      (user.email || "").trim().toLowerCase();

    if (!inviteEmail || !userEmail) {
      return res.status(400).json({
        error: "Invitation or account has no email",
      });
    }

    if (inviteEmail !== userEmail) {
      console.error("EMAIL MISMATCH:", {
        inviteEmail,
        userEmail,
      });

      return res.status(403).json({
        error: "Wrong account",
        invitedEmail: invite.email,
      });
    }

    // -----------------------------------
    // 6. MAKE SURE TEAM EXISTS
    // -----------------------------------

    const {
      data: team,
      error: teamError,
    } = await supabase
      .from("teams")
      .select("id")
      .eq("id", invite.team_id)
      .maybeSingle();

    if (teamError) {
      console.error("TEAM LOOKUP ERROR:", teamError);

      return res.status(500).json({
        error: "Failed to verify team",
        details: teamError.message,
      });
    }

    if (!team) {
      return res.status(404).json({
        error: "Team no longer exists",
      });
    }

    // -----------------------------------
    // 7. CHECK IF ALREADY A MEMBER
    // -----------------------------------

    const {
      data: existingMember,
      error: existingError,
    } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        "EXISTING MEMBER CHECK ERROR:",
        existingError
      );

      return res.status(500).json({
        error: "Failed to check team membership",
        details: existingError.message,
      });
    }

    // -----------------------------------
    // 8. INSERT MEMBER
    // -----------------------------------

    let member = existingMember;

    if (!member) {
      const {
        data: insertedMember,
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
          "TEAM MEMBER INSERT ERROR:",
          memberError
        );

        return res.status(500).json({
          error: "Failed to add member to team",
          details: memberError.message,
        });
      }

      member = insertedMember;

      console.log(
        "TEAM MEMBER CREATED:",
        member
      );
    } else {
      console.log(
        "USER ALREADY MEMBER:",
        member
      );
    }

    // -----------------------------------
    // 9. MARK INVITE ACCEPTED
    // -----------------------------------

    const {
      error: updateInviteError,
    } = await supabase
      .from("team_invites")
      .update({
        accepted: true,
        status: "accepted",
      })
      .eq("id", invite.id);

    if (updateInviteError) {
      console.error(
        "INVITE UPDATE ERROR:",
        updateInviteError
      );

      return res.status(500).json({
        error:
          "Member was added, but invitation could not be marked as accepted",
        details: updateInviteError.message,
      });
    }

    // -----------------------------------
    // 10. SUCCESS
    // -----------------------------------

    console.log(
      "========== INVITE ACCEPTED =========="
    );

    console.log("User:", user.id);
    console.log("Email:", user.email);
    console.log("Team:", invite.team_id);
    console.log("Member:", member.id);
    console.log("Invite:", invite.id);

    return res.status(200).json({
      success: true,
      teamId: invite.team_id,
      memberId: member.id,
      inviteId: invite.id,
    });

  } catch (err) {
    console.error(
      "ACCEPT INVITE FATAL ERROR:",
      err
    );

    return res.status(500).json({
      error: err.message || "Failed to accept invitation",
    });
  }
}