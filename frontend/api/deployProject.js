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

    // ✅ Parse repo
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");

    console.log("Parsed repo:", `${owner}/${repo}`);

    // ✅ GET REPO DATA (IMPORTANT → gives repoId)
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

    console.log("Repo ID:", repoId);

    // 🚀 CREATE DEPLOYMENT
    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,

          gitSource: {
            type: "github",
            repoId: repoId,      // ✅ REQUIRED
            ref: "main",
          },

          // ✅ STATIC DEPLOY FIX
          projectSettings: {
            framework: null,
            buildCommand: null,
            installCommand: null,
            outputDirectory: ".",
          },
        }),
      }
    );

    const text = await vercelRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Vercel NON-JSON:", text);
      return res.status(500).json({
        error: "Invalid Vercel response",
      });
    }

    if (!vercelRes.ok) {
      console.error("Vercel error:", data);
      return res.status(500).json({
        error: data.error?.message || "Deployment failed",
      });
    }

    return res.status(200).json({
      deploymentId: data.id,
      url: data.url,
    });

  } catch (err) {
    console.error("DEPLOY CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}