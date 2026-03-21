export default async function handler(req, res) {
  try {
    // -------------------------
    // METHOD CHECK
    // -------------------------
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, branch } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName required",
      });
    }

    // -------------------------
    // PARSE GITHUB URL
    // -------------------------
    let owner, repo;

    try {
      const url = new URL(repoUrl);

      const parts = url.pathname
        .replace(/^\/|\/$/g, "")
        .replace(".git", "")
        .split("/");

      owner = parts[0];
      repo = parts[1];
    } catch {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    if (!owner || !repo) {
      return res.status(400).json({
        error: "Could not extract repo",
      });
    }

    const repoPath = `${owner}/${repo}`;

    console.log("Using repo:", repoPath);

    // -------------------------
    // SANITIZE PROJECT NAME
    // -------------------------
    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/---+/g, "-")
      .slice(0, 100);

    // -------------------------
    // FETCH REPO FROM GITHUB
    // -------------------------
    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub API error:", githubData);

      return res.status(500).json({
        error: "GitHub repo not found OR no access",
        details: githubData,
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    console.log("Repo ID:", repoId);

    // -------------------------
    // CREATE VERCEL DEPLOYMENT
    // -------------------------
    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: safeName,

          gitSource: {
            type: "github",
            repoId: repoId,
            ref: branch || defaultBranch,
          },

          // 🚨 REQUIRED FOR NEW PROJECTS
          projectSettings: {
            framework: null, // auto-detect
          },
        }),
      }
    );

    const vercelData = await vercelRes.json();

    console.log("VERCEL RESPONSE:", vercelData);

    if (!vercelRes.ok) {
      console.error("Vercel API error:", vercelData);

      return res.status(500).json({
        error: vercelData.error?.message || "Deployment failed",
        details: vercelData,
      });
    }

    // -------------------------
    // SUCCESS RESPONSE
    // -------------------------
    return res.status(200).json({
      deploymentId: vercelData.id, // 🔥 IMPORTANT
      status: vercelData.readyState,
      url: vercelData.url,
    });
  } catch (err) {
    console.error("DEPLOY CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}