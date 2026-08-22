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
    GET USER PLAN
    =========================
    */

    const {
      data: userPlan,
      error: planError,
    } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (planError) {
      return res.status(500).json({
        error: "Could not verify user plan.",
      });
    }

    /*
    =========================
    FREE PLAN TEAM LIMIT
    =========================
    */

    if (
      (userPlan?.plan || "FREE") ===
      "FREE"
    ) {
      const {
        count,
        error: teamCountError,
      } = await supabase
        .from("teams")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("owner_id", user.id);

      if (teamCountError) {
        return res.status(500).json({
          error:
            "Could not verify team limit.",
        });
      }

      if ((count || 0) >= 1) {
        return res.status(403).json({
          error:
            "Free plan allows only one team.",
        });
      }
    }

    /*
    =========================
    TEAM NAME
    =========================
    */

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Missing team name.",
      });
    }

    /*
    =========================
    CREATE TEAM
    =========================
    */

    const {
      data: team,
      error: teamError,
    } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        owner_id: user.id,
      })
      .select()
      .single();

    if (teamError) {
      console.error(
        "[CREATE TEAM] ERROR:",
        teamError
      );

      return res.status(500).json({
        error:
          "Failed to create team.",
      });
    }

    /*
    =========================
    ADD OWNER AS MEMBER
    =========================
    */

    const {
      error: memberError,
    } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        email: user.email,
        role: "owner",
        status: "active",
      });

    if (memberError) {
      console.error(
        "[CREATE TEAM] OWNER MEMBER ERROR:",
        memberError
      );

      /*
      Roll the team back if owner
      membership could not be created.
      */

      await supabase
        .from("teams")
        .delete()
        .eq("id", team.id);

      return res.status(500).json({
        error:
          "Failed to create team membership.",
      });
    }

    /*
    =========================
    SUCCESS
    =========================
    */

    return res.status(200).json({
      team,
    });

  } catch (err) {
    console.error(
      "[CREATE TEAM] ERROR:",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Internal server error.",
    });
  }
}