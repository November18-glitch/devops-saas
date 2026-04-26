import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, teamId, projectId, userId } = req.body;

    // 🔥 STRICT VALIDATION (THIS FIXES YOUR BUG)
    if (!repoUrl || !projectName || !teamId || !projectId || !userId) {
      return res.status(400).json({
        error: "Missing repoUrl, projectName, teamId, projectId or userId",
      });
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");

    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(404).json({
        error: "GitHub repo not found or no access",
      });
    }

    const repoId = githubData.id;

    const uniqueProjectName =
      projectName.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now();

    // ✅ CORRECT VERCEL CALL
    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: uniqueProjectName,
          gitSource: {
            type: "github",
            repoId: repoId,
            ref: "main",
          },
        }),
      }
    );

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: data.error?.message || "Deployment failed",
      });
    }

    // 🔥 GUARANTEED NON-NULL INSERT
    const { error } = await supabase.from("deployments").insert({
      deployment_id: data.id,
      status: "BUILDING",
      logs: "🚀 Deployment started...",
      environment: "preview",
      triggered_by: "user",
      team_id: teamId,
      project_id: projectId,
      user_id: userId,
    });

    if (error) {
      console.error("❌ Supabase insert error:", error);
    }

    return res.status(200).json({
      deploymentId: data.id,
      url: data.url,
      projectName: uniqueProjectName,
    });

  } catch (err) {
    console.error("DEPLOY CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}