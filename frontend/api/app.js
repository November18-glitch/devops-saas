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
        req.headers.authorization
          ?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          error: "No token",
        });
      }

      const authSupabase =
        createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          }
        );

      const {
        data: {
          user,
        },
        error: authError,
      } =
        await authSupabase.auth.getUser();

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
      RETURN TEAM OBJECTS
      =========================
      */

      const teams =
        (members || [])
          .map(
            (member) =>
              member?.teams
          )
          .filter(
            (team) =>
              team !== null &&
              team !== undefined
          );

      console.log(
        "[GET TEAMS] FINAL TEAMS:",
        JSON.stringify(
          teams,
          null,
          2
        )
      );

      return res.status(200).json({
        teams,
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