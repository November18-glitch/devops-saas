import { createClient } from "@supabase/supabase-js";
import analyzeRepo from "./analyzeRepo.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createTroubleshooting(reason) {
  const text =
    (reason || "")
      .toLowerCase();

  const fixes = [];

  if (text.includes("package")) {
    fixes.push("• Add package.json");
  }

  if (text.includes("build")) {
    fixes.push("• Add build script");
  }

  if (text.includes("module")) {
    fixes.push(
      "• Install missing dependencies"
    );
  }

  if (text.includes("env")) {
    fixes.push(
      "• Configure environment variables"
    );
  }

  if (text.includes("framework")) {
    fixes.push(
      "• Verify framework detection"
    );
  }

  if (fixes.length === 0) {
    fixes.push(
      "• Verify repository structure"
    );
    fixes.push(
      "• Ensure package.json exists"
    );
    fixes.push(
      "• Verify build command"
    );
  }

  return fixes.join("\n");
}

async function insertFailedDeployment(
  teamId,
  projectId,
  userId,
  reason
) {
  try {
    await supabase
      .from("deployments")
      .insert({
        deployment_id:
          crypto.randomUUID(),

        status:
          "ERROR",

        logs:
`
❌ Deployment failed

Reason:
${reason}

How to fix:

${createTroubleshooting(
  reason
)}
`.trim(),

        environment:
          "preview",

        triggered_by:
          "user",

        team_id:
          teamId,

        project_id:
          projectId,

        user_id:
          userId,
      });

  } catch (e) {
    console.error(
      "[FAILED INSERT]",
      e
    );
  }
}

export default async function handler(
  req,
  res
) {
  try {
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
      repoUrl,
      projectName,
      teamId,
      projectId,
      userId,
    } = req.body;

    if (
      !repoUrl ||
      !projectName ||
      !teamId ||
      !projectId ||
      !userId
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing deployment fields",
        });
    }

    const match =
      repoUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)/
      );

    if (!match) {
      await insertFailedDeployment(
        teamId,
        projectId,
        userId,
        "Invalid GitHub repository URL"
      );

      return res
        .status(400)
        .json({
          error:
`
❌ Invalid GitHub URL

Example:
https://github.com/user/project
`.trim(),
        });
    }

    const owner =
      match[1];

    const repo =
      match[2]
        .replace(
          ".git",
          ""
        );

    console.log(
      "[CHECKING REPO]",
      owner,
      repo
    );

    const githubRes =
      await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        }
      );

    const github =
      await githubRes.json();

    if (
      !githubRes.ok ||
      github.archived
    ) {
      await insertFailedDeployment(
        teamId,
        projectId,
        userId,
        "Repository unavailable"
      );

      return res
        .status(404)
        .json({
          error:
`
❌ Repository unavailable

How to fix:
• Verify URL
• Make repo accessible
• Verify GitHub token
`.trim(),
        });
    }

    const repoId =
      github.id;

    console.log(
      "[ANALYZE]"
    );

    const analysis =
      await analyzeRepo(
        repoUrl
      );

    console.log(
      analysis
    );

    if (
      !analysis
    ) {
      await insertFailedDeployment(
        teamId,
        projectId,
        userId,
        "Repository analysis failed"
      );

      return res
        .status(400)
        .json({
          error:
            "Repository analysis failed",
        });
    }

    if (
      !analysis.deployable
    ) {
      await insertFailedDeployment(
        teamId,
        projectId,
        userId,
        analysis.reason
      );

      return res
        .status(400)
        .json({
          error:
`
❌ Deployment cancelled

Reason:
${analysis.reason}

How to fix:

${createTroubleshooting(
  analysis.reason
)}
`.trim(),
        });
    }

    const deploymentName =
      `${projectName
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        )}-${Date.now()}`;

    const vercelRes =
      await fetch(
        "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.VERCEL_TOKEN}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
           name: deploymentName,

           framework:
            analysis.framework,

           installCommand:
            "npm install",

           buildCommand:
            "npm run build",

           outputDirectory:
            "dist",

           gitSource: {
            type: "github",
            repoId,
            ref:
             analysis.branch ||
             github.default_branch ||
             "main",
           },
          }),
        }
      );

    const deployment =
      await vercelRes.json();

    if (
      !vercelRes.ok
    ) {

      await insertFailedDeployment(
        teamId,
        projectId,
        userId,
        deployment.error?.message ||
          deployment.message ||
          "Deployment rejected"
      );

      return res
        .status(500)
        .json({
          error:
            deployment.error?.message ||
            deployment.message,
        });
    }

    const url =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    await supabase
      .from(
        "deployments"
      )
      .insert({
        deployment_id:
          deployment.id,

        status:
          deployment.readyState ||
          "BUILDING",

        url,

        logs:
          "🚀 Deployment started",

        environment:
          "preview",

        triggered_by:
          "user",

        project_id:
          projectId,

        team_id:
          teamId,

        user_id:
          userId,
      });

    return res
      .status(200)
      .json({
        deploymentId:
          deployment.id,

        url,

        analysis,
      });

  } catch (
    err
  ) {

    console.error(
      "[DEPLOY ERROR]",
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