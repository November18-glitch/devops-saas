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

  if (
    text.includes(
      "framework"
    )
  ) {
    fixes.push(
`Framework could not be deployed.

Possible causes:
• Unsupported framework
• Framework auto-detection failed
• Missing config files

Solutions:
• Add package.json
• Add vercel.json if needed
• Try Vite / Next.js / Express`
    );
  }

  if (
    text.includes(
      "workspace"
    )
  ) {
    fixes.push(
`Monorepo detected.

Possible causes:
• Project inside subfolder
• Workspace packages unsupported

Solutions:
• Configure frontend root
• Add proper build directory`
    );
  }

  if (
    text.includes(
      "build"
    )
  ) {
    fixes.push(
`Build process failed.

Possible causes:
• Missing build script
• Syntax errors
• Wrong output folder

Solutions:
• Run npm run build locally
• Verify scripts`
    );
  }

  if (
    text.includes(
      "package"
    )
  ) {
    fixes.push(
`package.json issue.

Solutions:
• Verify package.json exists
• Add dependencies
• Commit lockfile`
    );
  }

  if (
    text.includes(
      "module"
    )
  ) {
    fixes.push(
`Dependency error.

Solutions:
• npm install
• Commit package-lock.json
• Check imports`
    );
  }

  if (
    text.includes(
      "repository"
    )
  ) {
    fixes.push(
`Repository unavailable.

Solutions:
• Verify URL
• Make repo public
• Check GitHub permissions`
    );
  }

  if (
    fixes.length === 0
  ) {
    fixes.push(
`General troubleshooting:

• Check repository structure
• Verify framework
• Run build locally
• Review deployment logs`
    );
  }

  return fixes.join(
    "\n\n"
  );
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
        ...(url
          ? { url }
          : {}),
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

  let tempDeploymentId =
    crypto.randomUUID();

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
    } = req.body;

    if (
      !repoUrl ||
      !projectName ||
      !teamId ||
      !projectId 
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing deployment fields",
        });
    }

    

/*
==========================
FREE PLAN DEPLOYMENT LIMIT
==========================
*/

const { data: team } = await supabase
  .from("teams")
  .select("owner_id")
  .eq("id", teamId)
  .single();

const { data: owner } = await supabase
  .from("users")
  .select("plan")
  .eq("id", team.owner_id)
  .single();

if ((owner?.plan || "FREE") === "FREE") {

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);

  const { count } = await supabase
    .from("deployments")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("team_id", teamId)
    .gte(
      "created_at",
      startOfMonth.toISOString()
    );

  if (count >= 5) {
    return res.status(403).json({
      error:
      "Free plan allows only 5 deployments per month."
    });
  }

}
await supabase
     .from("deployments")
     .insert({
     deployment_id: tempDeploymentId,
     project_id: projectId,
     team_id: teamId,
     status: "ANALYZING",
     logs: `
     🔎 Checking repository...

     Repository:
     ${repoUrl}
     `.trim(),
});
/*
==========================
REPOSITORY ANALYSIS
==========================
*/

    const analysis = await analyzeRepo(repoUrl);

console.log("[ANALYSIS]", analysis);

if (!analysis.valid) {
  throw new Error(analysis.reason);
}

if (!analysis.deployable) {
  throw new Error(analysis.reason);
}

const githubOwner = analysis.owner;
const repo = analysis.repo;

const githubRes = await fetch(
  `https://api.github.com/repos/${githubOwner}/${repo}`,
  {
    headers: {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      }),
    },
  }
);

if (!githubRes.ok) {
  const error = await githubRes.json().catch(() => ({}));

  throw new Error(
    error.message || "Unable to access GitHub repository."
  );
}

const github = await githubRes.json();


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

    const rootDirectory =
      analysis.detected?.includes(
        "frontend/package.json"
      )
        ? "frontend"
        : null;

    console.log(
     "VITE_SUPABASE_URL exists =",
     !!process.env.VITE_SUPABASE_URL
    );

    console.log(
     "VITE_SUPABASE_ANON_KEY exists =",
     !!process.env.VITE_SUPABASE_ANON_KEY
    );

const vercelFramework =
  analysis.framework === "react" &&
  analysis.outputDirectory === "dist"
    ? "vite"
    : analysis.framework;

const vercelPayload = {
  name: `${projectName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
  gitSource: {
    type: "github",
    repoId: github.id,
    ref: github.default_branch || "main",
  },
  projectSettings: {
    framework: vercelFramework,
    ...(rootDirectory ? { rootDirectory } : {}),
    installCommand: analysis.installCommand,
    buildCommand: analysis.buildCommand,
    outputDirectory: analysis.outputDirectory,
  },
};

console.log(
  "[ENV CHECK]",
  JSON.stringify(
    vercelPayload.env,
    null,
    2
  )
); 
    console.log(
      "[VERCEL PAYLOAD]",
      vercelPayload
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
              vercelPayload
            ),
        }
      );

    const deployment =
      await vercelRes.json();

    console.log(
      "[VERCEL RESPONSE]",
      deployment
    );

    if (
      !vercelRes.ok
    ) {
      throw new Error(
        deployment?.error?.message ||
        deployment?.message ||
        "Deployment rejected"
      );
    }

    await supabase
  .from("deployments")
  .update({
    status:
      deployment.readyState ||
      "BUILDING",

    url:
      deployment.url
        ? `https://${deployment.url}`
        : null,

    vercel_deployment_id:
      deployment.id,

    logs:
     `
      🚀 Deployment accepted

         Deployment ID:
          ${deployment.id}

         Framework:
          ${analysis.framework}
         `.trim()
        })
        .eq(
        "deployment_id",
        tempDeploymentId
      );

    return res
      .status(200)
      .json({

        deploymentId:
          deployment.id,

        localDeploymentId:
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