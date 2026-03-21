export default async function handler(req, res) {
  console.log("RAW repoUrl:", repoUrl)
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
    // 🔥 CLEAN + SAFE PARSING
    // -------------------------
    let cleanUrl = repoUrl.trim();

    // remove .git
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
    // 🔥 SANITIZE PROJECT NAME
    // -------------------------
    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/---+/g, "-")
      .slice(0, 100);

    // -------------------------
    // 🔥 GITHUB API (WITH TOKEN)
    // -------------------------
    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const githubData = await githubRes.json();

    console.log("GitHub response:", githubData);

    if (!githubRes.ok) {
      return res.status(500).json({
        error: "GitHub repo not found OR no access",
        repoPath,
        github: githubData,
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    // -------------------------
    // 🔥 VERCEL DEPLOYMENT
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
          projectSettings: {
            framework: null,
          },
        }),
      }
    );

    const vercelData = await vercelRes.json();

    console.log("Vercel response:", vercelData);

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: vercelData.error?.message || "Vercel deploy failed",
        details: vercelData,
      });
    }

    // -------------------------
    // ✅ SUCCESS
    // -------------------------
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