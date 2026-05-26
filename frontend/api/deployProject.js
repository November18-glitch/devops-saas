import { createClient } from "@supabase/supabase-js";
import analyzeRepo from "./analyzeRepo.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createTroubleshooting(reason) {
  const text = (reason || "").toLowerCase();

  const fixes = [];

  if (text.includes("package")) {
    fixes.push("• Add package.json");
  }

  if (text.includes("build")) {
    fixes.push("• Add build script");
  }

  if (text.includes("module")) {
    fixes.push("• Install missing dependencies");
  }

  if (text.includes("workspace")) {
    fixes.push("• Monorepo detected → configure root directory");
  }

  if (text.includes("framework")) {
    fixes.push("• Verify framework detection");
  }

  if (text.includes("env")) {
    fixes.push("• Configure environment variables");
  }

  if (text.includes("script")) {
    fixes.push("• Verify npm scripts");
  }

  if (fixes.length === 0) {
    fixes.push("• Verify repository structure");
    fixes.push("• Run build locally");
    fixes.push("• Check deployment configuration");
  }

  return fixes.join("\n");
}

async function updateDeployment(
  deploymentId,
  status,
  logs,
  url = null
) {
  try {
    await supabase
      .from("deployments")
      .update({
        status,
        logs,
        ...(url ? { url } : {}),
      })
      .eq(
        "deployment_id",
        deploymentId
      );

  } catch (err) {
    console.error(
      "[UPDATE ERROR]",
      err
    );
  }
}

export default async function handler(
  req,
  res
) {
  let tempDeploymentId = crypto.randomUUID();

  try {

    if (
      req.method !== "POST"
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

    await supabase
      .from(
        "deployments"
      )
      .insert({
        deployment_id:
          tempDeploymentId,

        status:
          "ANALYZING",

        logs:
`
🔎 Checking repository...

Repository:
${repoUrl}
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

    const match =
      repoUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)/i
      );

    if (!match) {
      throw new Error(
        "Invalid GitHub repository URL"
      );
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
      throw new Error(
        "Repository unavailable"
      );
    }

    const analysis =
      await analyzeRepo(
        repoUrl
      );

    console.log(
      analysis
    );

    if (
      !analysis?.deployable
    ) {
      throw new Error(
        analysis?.reason ||
        "Repository not deployable"
      );
    }

    await updateDeployment(
      tempDeploymentId,
      "BUILDING",

`
🚀 Deployment started

Framework:
${analysis.framework}

Install:
${analysis.installCommand}

Build:
${analysis.buildCommand}

Output:
${analysis.outputDirectory}

Detected:
${analysis.detected?.join(", ") || "None"}
`
    );

    const vercelRes =
      await fetch(
        "https://api.vercel.com/v13/deployments",
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${process.env.VERCEL_TOKEN}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              name:
                `${projectName
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    "-"
                  )}-${Date.now()}`,

              ...(analysis.framework
                ? {
                    framework:
                      analysis.framework,
                  }
                : {}),

              installCommand:
                analysis.installCommand,

              buildCommand:
                analysis.buildCommand,

              outputDirectory:
                analysis.outputDirectory,

              gitSource: {
                type:
                  "github",

                repoId:
                  github.id,

                ref:
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
      throw new Error(
        deployment?.error?.message ||
        deployment?.message ||
        "Deployment rejected"
      );
    }

    await updateDeployment(
      tempDeploymentId,

      deployment.readyState ||
      "BUILDING",

`
🚀 Deployment accepted

Deployment ID:
${deployment.id}
`,

      deployment.url
        ? `https://${deployment.url}`
        : null
    );

    return res
      .status(200)
      .json({
        deploymentId:
          tempDeploymentId,

        url:
          deployment.url
            ? `https://${deployment.url}`
            : null,

        analysis,
      });

  } catch (err) {

    console.error(
      "[DEPLOY ERROR]",
      err
    );

    await updateDeployment(
      tempDeploymentId,

      "ERROR",

`
❌ Deployment failed

Reason:

${err.message}

Troubleshooting:

${createTroubleshooting(
err.message
)}
`.trim()
    );

    return res
      .status(500)
      .json({
        error:
          err.message,
      });
  }
}