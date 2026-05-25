import { createClient } from "@supabase/supabase-js";
import analyzeRepo from "./analyzeRepo";

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
    =====================================
    CREATE PROJECT
    POST /api/app?action=createProject
    =====================================
    */

    if (action === "createProject") {
      if (req.method !== "POST") {
        return res
          .status(405)
          .json({
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
        return res
          .status(400)
          .json({
            error:
              "Missing required fields",
          });
      }

      const {
        data: user,
        error: userError,
      } = await supabase
        .from("users")
        .select("plan")
        .eq(
          "id",
          userId
        )
        .maybeSingle();

      if (userError) {
        return res
          .status(500)
          .json({
            error:
              "User lookup failed",
          });
      }

      const userPlan =
        user?.plan ||
        "FREE";

      if (
        userPlan ===
        "FREE"
      ) {
        const {
          count,
          error:
            countError,
        } =
          await supabase
            .from(
              "projects"
            )
            .select(
              "*",
              {
                count:
                  "exact",
                head: true,
              }
            )
            .eq(
              "team_id",
              teamId
            );

        if (
          countError
        ) {
          return res
            .status(500)
            .json({
              error:
                "Failed to check limits",
            });
        }

        if (
          count >=
          1
        ) {
          return res
            .status(403)
            .json({
              error:
                "Free plan allows only 1 project.",
            });
        }
      }

      const analysis =
        await analyzeRepo(
          repoUrl
        );

      if (
        !analysis.valid
      ) {
        return res
          .status(400)
          .json({
            error:
              analysis.reason,
          });
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "projects"
          )
          .insert({
            name,
            repo_url:
              repoUrl,
            repo_type:
              "github",
            default_branch:
              analysis.defaultBranch,
            team_id:
              teamId,
          })
          .select()
          .single();

      if (
        error
      ) {
        return res
          .status(500)
          .json({
            error:
              "Failed to create project",
          });
      }

      return res
        .status(200)
        .json({
          project:
            data,
        });
    }

    /*
    =====================================
    DELETE TEAM
    POST /api/app?action=deleteTeam
    =====================================
    */

    if (action === "deleteTeam") {
      if (
        req.method !==
        "POST"
      ) {
        return res
          .status(405)
          .json({
            error:
              "Method not allowed",
          });
      }

      const {
        teamId,
      } =
        req.body;

      if (
        !teamId
      ) {
        return res
          .status(400)
          .json({
            error:
              "Missing teamId",
          });
      }

      await supabase
        .from(
          "team_members"
        )
        .delete()
        .eq(
          "team_id",
          teamId
        );

      await supabase
        .from(
          "projects"
        )
        .delete()
        .eq(
          "team_id",
          teamId
        );

      const {
        error,
      } =
        await supabase
          .from(
            "teams"
          )
          .delete()
          .eq(
            "id",
            teamId
          );

      if (
        error
      ) {
        return res
          .status(500)
          .json({
            error:
              "Failed to delete team",
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,
        });
    }

    /*
    =====================================
    GET DEPLOYMENTS
    GET /api/app?action=getDeployments
    =====================================
    */

    if (
      action ===
      "getDeployments"
    ) {
      if (
        req.method !==
        "GET"
      ) {
        return res
          .status(405)
          .json({
            error:
              "Method not allowed",
          });
      }

      const {
        teamId,
        projectId,
      } =
        req.query;

      let query =
        supabase
          .from(
            "deployments"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (
        projectId
      ) {
        query =
          query.eq(
            "project_id",
            projectId
          );
      } else if (
        teamId
      ) {
        query =
          query.eq(
            "team_id",
            teamId
          );
      }

      const {
        data,
        error,
      } =
        await query;

      if (
        error
      ) {
        return res
          .status(500)
          .json({
            error:
              "Failed to fetch deployments",
          });
      }

      return res
        .status(200)
        .json({
          deployments:
            data,
        });
    }

    return res
      .status(404)
      .json({
        error:
          "Unknown action",
      });

  } catch (err) {
    console.error(
      err
    );

    return res
      .status(500)
      .json({
        error:
          err.message,
      });
  }
}