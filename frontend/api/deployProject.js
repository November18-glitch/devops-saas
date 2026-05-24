import { createClient } from "@supabase/supabase-js";
import analyzeRepo from "./analyzeRepo";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createTroubleshooting(reason) {
  const text =
    (reason || "")
      .toLowerCase();

  const fixes = [];

  if (
    text.includes(
      "package"
    )
  ) {
    fixes.push(
      "• Add package.json"
    );
  }

  if (
    text.includes(
      "build"
    )
  ) {
    fixes.push(
      "• Add build script"
    );
  }

  if (
    text.includes(
      "module"
    )
  ) {
    fixes.push(
      "• Install missing dependencies"
    );
  }

  if (
    text.includes(
      "env"
    )
  ) {
    fixes.push(
      "• Configure environment variables"
    );
  }

  if (
    text.includes(
      "framework"
    )
  ) {
    fixes.push(
      "• Verify framework detection"
    );
  }

  if (
    fixes.length === 0
  ) {
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
        owner,
        repo
      );

    console.log(
      analysis
    );

    if (
      !analysis
    ) {
      return res
        .status(400)
        .json({
          error:
`
❌ Repository analysis failed

Could not inspect repository.
`.trim(),
        });
    }

    if (
      !analysis.deployable
    ) {
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

    if (
      !analysis.framework ||
      !analysis.buildCommand
    ) {
      return res
        .status(400)
        .json({
          error:
`
❌ Missing deployment configuration

How to fix:
• package.json
• build script
• framework setup
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

    console.log(
      "[DEPLOY]"
    );

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

          body:
            JSON.stringify(
              {
                name:
                  deploymentName,

                framework:
                  analysis.framework,

                installCommand:
                  analysis.installCommand,

                buildCommand:
                  analysis.buildCommand,

                outputDirectory:
                  analysis.outputDirectory,

                gitSource:
                  {
                    type:
                      "github",

                    repoId,

                    ref:
                      analysis.branch ||
                      github.default_branch ||
                      "main",
                  },
              }
            ),
        }
      );

    const deployment =
      await vercelRes.json();

    console.log(
      deployment
    );

    if (
      !vercelRes.ok
    ) {
      return res
        .status(500)
        .json({
          error:
`
❌ Deployment rejected

${deployment.error?.message || deployment.message}

How to fix:
• Verify build command
• Verify framework
• Check repo root
`.trim(),
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
`
🚀 Deployment started

Framework:
${analysis.framework}

Build:
${analysis.buildCommand}

Install:
${analysis.installCommand}

Output:
${analysis.outputDirectory}

Detected:
${
analysis.detected?.join(
", "
) ||
"None"
}
`.trim(),

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
`
❌ Internal deploy error

${err.message}
`.trim(),
      });
  }
}