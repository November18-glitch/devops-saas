export default async function handler(req, res) {
  try {
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
    // 🔥 CLEAN PARSING (FIXED)
    // -------------------------
    let cleanUrl = repoUrl.trim();

    // remove .git if present
    cleanUrl = cleanUrl.replace(/\.git$/, "");

    // remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, "");

    const match = cleanUrl.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/
    );

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL format",
      });
    }

    const owner = match[1];
    const repo = match[2];

    const repoPath = `${owner}/${repo}`;

    console.log("Parsed repo:", repoPath);

    // -------------------------
    // SANITIZE NAME
    // -------------------------
    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/---+/g, "-")
      .slice(0, 100);

    // -------------------------
    // 🔥 GITHUB REQUEST (FIXED)
    // -------------------------
    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`
      // ❗ NO TOKEN NEEDED for PUBLIC repo
    );

    const githubData = await githubRes.json();

    console.log("GitHub response:", githubData);

    if (!githubRes.ok) {
      return res.status(500).json({
        error: "GitHub repo not found",
        repoPath,
        github: githubData,
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    // -------------------------
    // VERCEL DEPLOY
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
          projectSettings: {
            framework: null,
          },
        }),
      }
    );

    const vercelData = await vercelRes.json();

    console.log("VERCEL:", vercelData);

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: vercelData.error?.message || "Deploy failed",
        details: vercelData,
      });
    }

    return res.status(200).json({
      deploymentId: vercelData.id,
      status: vercelData.readyState,
      url: vercelData.url,
    });

  } catch (err) {
    console.error("CRASH:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}