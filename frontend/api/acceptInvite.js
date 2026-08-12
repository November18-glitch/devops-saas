import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log("========== ACCEPT INVITE ==========");

  if (req.method !== "POST") {
    console.log("METHOD:", req.method);

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const authHeader =
      req.headers.authorization || "";

    const accessToken =
      authHeader.replace("Bearer ", "");

    console.log(
      "AUTH TOKEN PRESENT:",
      !!accessToken
    );

    if (!accessToken) {
      return res.status(401).json({
        error: "Missing authorization token",
      });
    }

    /*
    ========================================
    AUTH USER
    ========================================
    */

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    const user = authData?.user;

    console.log(
      "AUTH USER:",
      user?.id || null
    );

    console.log(
      "AUTH EMAIL:",
      user?.email || null
    );

    if (authError) {
      console.error(
        "AUTH ERROR:",
        authError
      );

      return res.status(401).json({
        error: authError.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    /*
    ========================================
    INVITE TOKEN
    ========================================
    */

    const {
      inviteToken,
    } = req.body || {};

    console.log(
      "INVITE TOKEN PRESENT:",
      !!inviteToken
    );

    if (!inviteToken) {
      return res.status(400).json({
        error: "Missing inviteToken",
      });
    }

    /*
    ========================================
    FIND INVITE
    ========================================
    */

    const {
      data: invite,
      error: inviteError,
    } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", inviteToken)
      .maybeSingle();

    console.log(
      "INVITE LOOKUP ERROR:",
      inviteError
    );

    console.log(
      "INVITE FOUND:",
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
      return res.status(500).json({
        error:
          inviteError.message,
      });
    }

    if (!invite) {
      return res.status(404).json({
        error: "Invite not found",
      });
    }

    /*
    ========================================
    VALIDATE INVITE
    ========================================
    */

    if (invite.accepted === true) {
      return res.status(400).json({
        error: "Invite already accepted",
      });
    }

    if (
      invite.email?.trim().toLowerCase() !==
      user.email?.trim().toLowerCase()
    ) {
      console.log(
        "EMAIL MISMATCH",
        {
          inviteEmail: invite.email,
          userEmail: user.email,
        }
      );

      return res.status(403).json({
        error: "Wrong account",
      });
    }

    /*
    ========================================
    CHECK EXISTING MEMBER
    ========================================
    */

    const {
      data: existingMember,
      error: existingError,
    } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, email, role, status")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    console.log(
      "EXISTING MEMBER ERROR:",
      existingError
    );

    console.log(
      "EXISTING MEMBER:",
      existingMember
    );

    if (existingError) {
      return res.status(500).json({
        error:
          existingError.message,
      });
    }

    /*
    ========================================
    INSERT MEMBER
    ========================================
    */

    let member = existingMember;

    if (!member) {
      console.log(
        "🔥 INSERTING TEAM MEMBER"
      );

      const {
        data: insertedMember,
        error: insertError,
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

      console.log(
        "INSERTED MEMBER:",
        insertedMember
      );

      console.log(
        "INSERT ERROR:",
        insertError
      );

      if (insertError) {
        return res.status(500).json({
          error:
            insertError.message,
          code:
            insertError.code || null,
          details:
            insertError.details || null,
          hint:
            insertError.hint || null,
        });
      }

      member = insertedMember;
    }

    /*
    ========================================
    UPDATE INVITE
    ========================================
    */

    console.log(
      "🔥 UPDATING INVITE:",
      invite.id
    );

    const {
      data: updatedInvite,
      error: updateError,
    } = await supabase
      .from("team_invites")
      .update({
        accepted: true,
        status: "accepted",
      })
      .eq("id", invite.id)
      .select()
      .single();

    console.log(
      "UPDATED INVITE:",
      updatedInvite
    );

    console.log(
      "UPDATE ERROR:",
      updateError
    );

    if (updateError) {
      return res.status(500).json({
        error:
          updateError.message,
        code:
          updateError.code || null,
        details:
          updateError.details || null,
        hint:
          updateError.hint || null,
      });
    }

    /*
    ========================================
    VERIFY MEMBER
    ========================================
    */

    const {
      data: verifyMember,
      error: verifyMemberError,
    } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    console.log(
      "VERIFY MEMBER:",
      verifyMember
    );

    console.log(
      "VERIFY MEMBER ERROR:",
      verifyMemberError
    );

    /*
    ========================================
    VERIFY INVITE
    ========================================
    */

    const {
      data: verifyInvite,
      error: verifyInviteError,
    } = await supabase
      .from("team_invites")
      .select("*")
      .eq("id", invite.id)
      .single();

    console.log(
      "VERIFY INVITE:",
      verifyInvite
    );

    console.log(
      "VERIFY INVITE ERROR:",
      verifyInviteError
    );

    /*
    ========================================
    FINAL VALIDATION
    ========================================
    */

    if (!verifyMember) {
      console.error(
        "❌ MEMBER INSERT DID NOT PERSIST"
      );

      return res.status(500).json({
        error:
          "Team member was not persisted.",
      });
    }

    if (
      !verifyInvite ||
      verifyInvite.accepted !== true
    ) {
      console.error(
        "❌ INVITE UPDATE DID NOT PERSIST"
      );

      return res.status(500).json({
        error:
          "Invite was not marked accepted.",
      });
    }

    console.log(
      "🎉🎉🎉 FULL INVITE ACCEPTANCE SUCCESS 🎉🎉🎉"
    );

    return res.status(200).json({
      success: true,
      teamId: invite.team_id,
      member: verifyMember,
      invite: verifyInvite,
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