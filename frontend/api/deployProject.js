export default async function handler(req, res) {
  try {
    // -------------------------
    // Only POST allowed
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
    // CLEAN & PARSE REPO URL
    // -------------------------

    let cleanUrl = repoUrl.trim();

    // remove duplicate pasted URLs (VERY IMPORTANT)
    if (cleanUrl.includes("https://github.com/https://github.com/")) {
      cleanUrl = cleanUrl.replace(
        "https://github.com/https://github.com/",
        "https://github.com/"
      );
    }

    // remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, "");

    let owner;
    let repo;

    try {
      const url = new URL(cleanUrl);

      const parts = url.pathname
        .replace(/^\/|\/$/g, "")
        .split("/");

      owner = parts[0];

      repo = parts[1]
        ?.replace(".git", "")
        .split("?")[0]
        .split("#")[0]
        .trim();

    } catch (err) {
      return res.status(400).json({
        error: "Invalid GitHub repository URL",
      });
    }

    if (!owner || !repo) {
      return res.status(400).json({
        error: "Could not extract owner/repo",
      });
    }

    const repoPath = `${owner}/${repo}`;

    console.log("FINAL REPO PATH:", repoPath);

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
    // FETCH GITHUB REPO
    // -------------------------

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // IMPORTANT
        },
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub API error:", githubData);

      return res.status(500).json({
        error: "GitHub repo not found",
        repoPath,
        details: githubData,
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    console.log("Repo found:", repoPath, "ID:", repoId);

    // -------------------------
    // CREATE VERCEL DEPLOYMENT
    // -------------------------

    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
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

          // REQUIRED FIX
          projectSettings: {
            framework: null,
          },
        }),
      }
    );

    const vercelData = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error("Vercel API error:", vercelData);

      return res.status(500).json({
        error: vercelData.error?.message || "Deployment failed",
        details: vercelData,
      });
    }

    console.log("Deployment created:", vercelData.id);

    return res.status(200).json({
      deploymentId: vercelData.id,
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