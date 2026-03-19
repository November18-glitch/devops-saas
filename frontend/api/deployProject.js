export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, branch } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName required"
      });
    }

    // -------------------------
    // Parse GitHub URL
    // -------------------------

    let owner;
    let repo;

    try {
      const url = new URL(repoUrl);

      const parts = url.pathname
        .replace(/^\/|\/$/g, "")
        .split("/");

      owner = parts[0];
      repo = parts[1];

    } catch {
      return res.status(400).json({
        error: "Invalid GitHub URL"
      });
    }

    if (!owner || !repo) {
      return res.status(400).json({
        error: "Invalid repo format"
      });
    }

    const repoPath = `${owner}/${repo}`;

    console.log("Parsed repo:", repoPath);

    // -------------------------
    // Sanitize project name
    // -------------------------

    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/---+/g, "-")
      .slice(0, 100);

    // -------------------------
    // 🔥 FIX: AUTHENTICATED GitHub request
    // -------------------------

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub API error:", githubData);

      return res.status(500).json({
        error: "GitHub repo not found OR no access",
        details: githubData,
        repoPath
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    console.log("Repo ID:", repoId);

    // -------------------------
    // Create Vercel deployment
    // -------------------------

    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: safeName,
          gitSource: {
            type: "github",
            repoId: repoId,
            ref: branch || defaultBranch
          },
          projectSettings: {
            framework: null
          }
        })
      }
    );

    const vercelData = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error("Vercel API error:", vercelData);

      return res.status(500).json({
        error: vercelData.error?.message || "Deployment failed",
        details: vercelData
      });
    }

    return res.status(200).json({
      deploymentId: vercelData.id,
      status: vercelData.readyState,
      url: `https://${vercelData.url}`
    });

  } catch (err) {

    console.error("CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });

  }
}