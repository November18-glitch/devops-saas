import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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
    /*
    =========================
    AUTHENTICATE USER
    =========================
    */

    const token =
      req.headers.authorization?.replace(
        "Bearer ",
        ""
      );

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    /*
    =========================
    REQUEST DATA
    =========================
    */

    const {
      teamId,
      email,
      role = "member",
    } = req.body;

    if (!teamId || !email) {
      return res.status(400).json({
        error: "Missing teamId or email.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    /*
    =========================
    GET TEAM
    =========================
    */

    const {
      data: team,
      error: teamError,
    } = await supabase
      .from("teams")
      .select("id, owner_id, name")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({
        error: "Team not found.",
      });
    }

    /*
    =========================
    OWNER CHECK
    =========================
    */

    if (team.owner_id !== user.id) {
      return res.status(403).json({
        error:
          "Only the team owner can invite members.",
      });
    }

    /*
    =========================
    GET OWNER PLAN
    =========================
    */

    const {
      data: owner,
      error: ownerError,
    } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (ownerError) {
      return res.status(500).json({
        error: "Could not verify user plan.",
      });
    }

    const plan =
      owner?.plan || "FREE";

    /*
    =========================
    FREE PLAN MEMBER LIMIT
    =========================
    */

    if (plan === "FREE") {
      const {
        count,
        error: memberCountError,
      } = await supabase
        .from("team_members")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("team_id", teamId)
        .eq("status", "active");

      if (memberCountError) {
        return res.status(500).json({
          error:
            "Could not verify team member limit.",
        });
      }

      if ((count || 0) >= 3) {
        return res.status(403).json({
          error:
            "Free plan allows a maximum of 3 active members.",
        });
      }
    }

    /*
    =========================
    CHECK IF ALREADY MEMBER
    =========================
    */

    const {
      data: existingMember,
    } = await supabase
      .from("team_members")
      .select("id, email, status")
      .eq("team_id", teamId)
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (
      existingMember &&
      existingMember.status === "active"
    ) {
      return res.status(409).json({
        error:
          "This person is already a member of the team.",
      });
    }

    /*
    =========================
    CHECK EXISTING PENDING INVITE
    =========================
    */

    const {
      data: existingInvite,
    } = await supabase
      .from("team_invites")
      .select("id, status")
      .eq("team_id", teamId)
      .ilike("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return res.status(409).json({
        error:
          "There is already a pending invitation for this email.",
      });
    }

    /*
    =========================
    CREATE INVITATION TOKEN
    =========================
    */

    const inviteToken =
      crypto.randomUUID();

    /*
    =========================
    SAVE INVITATION
    =========================
    */

    const {
      error: inviteError,
    } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        email: normalizedEmail,
        role,
        token: inviteToken,
        accepted: false,
        status: "pending",
      });

    if (inviteError) {
      console.error(
        "[INVITE] INSERT ERROR:",
        inviteError
      );

      return res.status(500).json({
        error:
          "Failed to create invitation.",
      });
    }

    /*
    =========================
    SEND EMAIL
    =========================
    */

    const origin =
      req.headers.origin ||
      process.env.APP_URL;

    if (!origin) {
      return res.status(500).json({
        error:
          "Application URL is not configured.",
      });
    }

    const emailResponse =
      await fetch(
        `${origin}/api/sendInviteEmail`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: normalizedEmail,
            token: inviteToken,
            teamName: team.name,
          }),
        }
      );

    if (!emailResponse.ok) {
      console.error(
        "[INVITE] EMAIL SEND FAILED:",
        await emailResponse.text()
      );

      return res.status(500).json({
        error:
          "Invitation was created, but the email could not be sent.",
      });
    }

    /*
    =========================
    SUCCESS
    =========================
    */

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error(
      "[INVITE] ERROR:",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Internal server error.",
    });
  }
}