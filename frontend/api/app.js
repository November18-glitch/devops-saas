import { createClient } from "@supabase/supabase-js";
import analyzeRepo from "./analyzeRepo.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { action } = req.query;

    if (!action) {
      return res.status(400).json({
        error: "Missing action",
      });
    }

    /*
    =========================
    GET USER PLAN
    =========================
    */

    if (action === "getUserPlan") {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: "Missing userId",
        });
      }

      const { data, error } = await supabase
        .from("users")
        .select("plan")
        .eq("id", userId)
        .single();

      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.status(200).json({
        plan: data?.plan || "FREE",
      });
    }

    /*
    =========================
    CREATE PROJECT
    =========================
    */

    if (action === "createProject") {
      if (req.method !== "POST") {
        return res.status(405).json({
          error: "Method not allowed",
        });
      }

      const {
        name,
        repoUrl,
        teamId,
        userId,
      } = req.body;

      if (
        !name ||
        !repoUrl ||
        !teamId ||
        !userId
      ) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from("users")
        .select("plan")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        return res.status(500).json({
          error: "User lookup failed",
        });
      }

      const userPlan =
        user?.plan || "FREE";

      /*
      =========================
      FREE PROJECT LIMIT
      =========================
      */

      if (userPlan === "FREE") {
        const { count } = await supabase
          .from("projects")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("team_id", teamId);

        if (count >= 1) {
          return res.status(403).json({
            error:
              "Free plan allows only 1 project.",
          });
        }
      }
/* =========================
   ANALYZER V4 — PRO ONLY
   ========================= */

if (userPlan !== "PRO") {
  return res.status(403).json({
    error: "Analyzer V4 requires a Pro plan.",
    code: "PRO_REQUIRED",
  });
}
      /*
      =========================
      ANALYZE REPOSITORY
      =========================
      */

      const analysis =
        await analyzeRepo(repoUrl);

      /*
      =========================
      CREATE PROJECT
      =========================
      */

      const {
        data,
        error,
      } = await supabase
        .from("projects")
        .insert({
          name,
          repo_url: repoUrl,
          repo_type: "github",

          default_branch:
            analysis.defaultBranch ||
            "main",

          team_id: teamId,
          user_id: userId,

          env_vars:
            req.body.envVars || {},

          deployable:
            analysis.deployable ??
            false,

          framework:
            analysis.framework ||
            null,

          analysis_reason:
            analysis.reason ||
            null,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "[CREATE PROJECT ERROR]",
          error
        );

        return res.status(500).json({
          error:
            error.message ||
            "Failed to create project",
        });
      }

      return res.status(200).json({
        project: data,
      });
    }

    /*
    =========================
    DELETE TEAM
    =========================
    */

    if (action === "deleteTeam") {
      if (req.method !== "POST") {
        return res.status(405).json({
          error: "Method not allowed",
        });
      }

      const { teamId } =
        req.body;

      if (!teamId) {
        return res.status(400).json({
          error: "Missing teamId",
        });
      }

      const {
        error: memberDeleteError,
      } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId);

      if (memberDeleteError) {
        return res.status(500).json({
          error:
            memberDeleteError.message,
        });
      }

      const {
        error: projectDeleteError,
      } = await supabase
        .from("projects")
        .delete()
        .eq("team_id", teamId);

      if (projectDeleteError) {
        return res.status(500).json({
          error:
            projectDeleteError.message,
        });
      }

      const {
        error: teamDeleteError,
      } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (teamDeleteError) {
        return res.status(500).json({
          error:
            teamDeleteError.message,
        });
      }

      return res.status(200).json({
        success: true,
      });
    }

    /*
    =========================
    GET DEPLOYMENTS
    =========================
    */

    if (action === "getDeployments") {
      const {
        teamId,
        projectId,
      } = req.query;

      let query =
        supabase
          .from("deployments")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (projectId) {
        query =
          query.eq(
            "project_id",
            projectId
          );
      }

      if (teamId) {
        query =
          query.eq(
            "team_id",
            teamId
          );
      }

      const {
        data,
        error,
      } = await query;

      if (error) {
        return res.status(500).json({
          error:
            "Failed to fetch deployments",
        });
      }

      return res.status(200).json({
        deployments:
          data || [],
      });
    }

    /*
    =========================
    GET PROJECT BY ID
    =========================
    */

    if (action === "getProjectById") {
      const { id } =
        req.query;

      if (!id) {
        return res.status(400).json({
          error: "Missing project id",
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.status(200).json({
        project: data,
      });
    }

    /*
    =========================
    GET PROJECTS
    =========================
    */

    if (action === "getProjects") {
      const { teamId } =
        req.query;

      if (!teamId) {
        return res.status(400).json({
          error: "Missing teamId",
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("team_id", teamId)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        return res.status(500).json({
          error:
            "Failed to fetch projects",
        });
      }

      return res.status(200).json({
        projects:
          data || [],
      });
    }

/*
=========================
GET TEAMS
=========================
*/

if (action === "getTeams") {
  const token =
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: "No token",
    });
  }

  const authSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: {
      user,
    },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "[GET TEAMS] AUTH ERROR:",
      authError
    );

    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  console.log(
    "[GET TEAMS] USER:",
    user.id,
    user.email
  );

  /*
  =========================
  GET MEMBERSHIPS
  =========================
  */

  const {
    data: members,
    error: memberError,
  } =
    await supabase
      .from("team_members")
      .select(`
        id,
        team_id,
        user_id,
        role,
        email,
        status,
        teams (
          id,
          name,
          owner_id,
          created_at
        )
      `)
      .eq(
        "user_id",
        user.id
      );

  console.log(
    "[GET TEAMS] RAW MEMBERS:",
    JSON.stringify(
      members,
      null,
      2
    )
  );

  if (memberError) {
    console.error(
      "[GET TEAMS] MEMBER ERROR:",
      memberError
    );

    return res.status(500).json({
      error:
        "Failed to fetch teams",
    });
  }

  /*
  =========================
  GET TEAM OBJECTS
  =========================
  */

  const rawTeams =
    (members || [])
      .map(
        (member) =>
          member?.teams
      )
      .filter(Boolean);

  /*
  =========================
  GET MEMBER COUNTS
  =========================
  */

  const teamIds =
    rawTeams
      .map((team) => team.id)
      .filter(Boolean);

  let memberCounts = {};

  if (teamIds.length > 0) {
    const {
      data: allMembers,
      error: allMembersError,
    } = await supabase
      .from("team_members")
      .select(`
        id,
        team_id,
        user_id,
        role,
        email,
        status
      `)
      .in(
        "team_id",
        teamIds
      )
      .eq("status", "active");

    if (allMembersError) {
      console.error(
        "[GET TEAMS] MEMBER COUNT ERROR:",
        allMembersError
      );

      return res.status(500).json({
        error:
          "Failed to fetch team members",
      });
    }

    /*
    =========================
    BUILD COUNTS
    =========================
    */

    for (const member of allMembers || []) {
      if (!memberCounts[member.team_id]) {
        memberCounts[member.team_id] = 0;
      }

      memberCounts[member.team_id]++;
    }
  }

  /*
  =========================
  BUILD FINAL TEAMS
  =========================
  */

  const teams =
  rawTeams.map((team) => ({
    id: team.id,
    name: team.name,
    owner_id: team.owner_id,
    created_at: team.created_at,

    // Number of ACTIVE members only
    member_count:
      memberCounts[team.id] || 0,

    // FREE plan limit
    max_members: 3,

    // Current logged-in user is the owner
    is_owner:
      team.owner_id === user.id,

    // Useful for the UI
    is_full:
      (memberCounts[team.id] || 0) >= 3,
  }));

  /*
  =========================
  REMOVE DUPLICATE TEAMS
  =========================
  */

  const uniqueTeams = Array.from(
    new Map(
      teams.map((team) => [
        team.id,
        team,
      ])
    ).values()
  );

  console.log(
  "[GET TEAMS] MEMBER COUNTS:",
  JSON.stringify(memberCounts, null, 2)
);

  console.log(
    "[GET TEAMS] FINAL TEAMS:",
    JSON.stringify(
      uniqueTeams,
      null,
      2
    )
  );

  return res.status(200).json({
    teams: uniqueTeams,
  });
}

/*
=========================
GET TEAM MEMBERS
=========================
*/

if (action === "getTeamMembers") {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const token =
    req.headers.authorization?.replace(
      "Bearer ",
      ""
    );

  if (!token) {
    return res.status(401).json({
      error: "No token",
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

  const { teamId } = req.query;

  if (!teamId) {
    return res.status(400).json({
      error: "Missing teamId",
    });
  }

  /*
  =========================
  VERIFY USER BELONGS TO TEAM
  =========================
  */

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("team_members")
    .select("id, role, status")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    return res.status(500).json({
      error: membershipError.message,
    });
  }

  if (!membership) {
    return res.status(403).json({
      error: "You are not an active member of this team.",
    });
  }

  /*
  =========================
  GET ACTIVE MEMBERS
  =========================
  */

  const {
    data: members,
    error: membersError,
  } = await supabase
    .from("team_members")
    .select(
      "id, team_id, user_id, email, role, status, created_at"
    )
    .eq("team_id", teamId)
    .eq("status", "active")
    .order("created_at", {
      ascending: true,
    });

  if (membersError) {
    return res.status(500).json({
      error: membersError.message,
    });
  }

  return res.status(200).json({
    members: members || [],
  });
}

/*
=========================
REMOVE TEAM MEMBER
=========================
*/

if (action === "removeMember") {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const token =
    req.headers.authorization?.replace(
      "Bearer ",
      ""
    );

  if (!token) {
    return res.status(401).json({
      error: "No token",
    });
  }

  /*
  =========================
  AUTHENTICATE USER
  =========================
  */

  const {
    data: {
      user,
    },
    error: authError,
  } =
    await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const {
    teamId,
    memberId,
  } = req.body;

  if (!teamId || !memberId) {
    return res.status(400).json({
      error:
        "Missing teamId or memberId",
    });
  }

  /*
  =========================
  VERIFY TEAM OWNER
  =========================
  */

  const {
    data: team,
    error: teamError,
  } =
    await supabase
      .from("teams")
      .select("id, owner_id")
      .eq("id", teamId)
      .single();

  if (teamError || !team) {
    return res.status(404).json({
      error: "Team not found",
    });
  }

  if (team.owner_id !== user.id) {
    return res.status(403).json({
      error:
        "Only the team owner can remove members.",
    });
  }

  /*
  =========================
  FIND MEMBER
  =========================
  */

  const {
    data: member,
    error: memberError,
  } =
    await supabase
      .from("team_members")
      .select(`
        id,
        team_id,
        user_id,
        role,
        email,
        status
      `)
      .eq("id", memberId)
      .eq("team_id", teamId)
      .single();

  if (memberError || !member) {
    return res.status(404).json({
      error: "Member not found",
    });
  }

  /*
  =========================
  NEVER REMOVE OWNER
  =========================
  */

  if (
    member.user_id === team.owner_id ||
    member.role === "owner"
  ) {
    return res.status(403).json({
      error:
        "The team owner cannot be removed.",
    });
  }

  /*
  =========================
  DELETE MEMBER
  =========================
  */

  const {
    error: deleteError,
  } =
    await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("team_id", teamId);

  if (deleteError) {
    console.error(
      "[REMOVE MEMBER] DELETE ERROR:",
      deleteError
    );

    return res.status(500).json({
      error:
        "Failed to remove member.",
    });
  }

  return res.status(200).json({
    success: true,
  });
}


    /*
    =========================
    UNKNOWN ACTION
    =========================
    */

    return res.status(404).json({
      error:
        "Unknown action",
    });

  } catch (err) {
    console.error(
      "[APP ERROR]",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Internal server error",
    });
  }
}