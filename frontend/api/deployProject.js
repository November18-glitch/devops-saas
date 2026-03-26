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

    const { repoUrl, projectName } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "Missing repoUrl or projectName",
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

    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments",
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
          projectSettings: {
            framework: null,
            buildCommand: "",
            installCommand: "",
            outputDirectory: ".",
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

    // ✅ FIXED INSERT (WITH ERROR LOGGING)
    const { error } = await supabase.from("deployments").insert({
      deployment_id: data.id,
      project_id: uniqueProjectName, // 🔥 REQUIRED FIX
      status: "BUILDING",
      logs: null,
      environment: "preview",
      triggered_by: "user",
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