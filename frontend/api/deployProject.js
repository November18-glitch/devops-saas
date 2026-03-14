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
    // Parse GitHub URL properly
    // -------------------------

    let owner;
    let repo;

    try {

      const url = new URL(repoUrl);

      const parts = url.pathname
        .replace(/^\/|\/$/g, "") // remove leading/trailing /
        .split("/");

      owner = parts[0];
      repo = parts[1];

    } catch {
      return res.status(400).json({
        error: "Invalid GitHub repository URL"
      });
    }

    if (!owner || !repo) {
      return res.status(400).json({
        error: "Could not extract owner/repo from URL"
      });
    }

    const repoPath = `${owner}/${repo}`;

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
    // Fetch repo info from GitHub
    // -------------------------

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub API error:", githubData);

      return res.status(500).json({
        error: "GitHub repo not found",
        repoPath
      });
    }

    const repoId = githubData.id;
    const defaultBranch = githubData.default_branch;

    // -------------------------
    // Create Vercel deployment
    // -------------------------

    const vercelRes = await fetch(
      "https://api.vercel.com/v13/deployments",
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
          }
        })
      }
    );

    const vercelData = await vercelRes.json();

    if (!vercelRes.ok) {
      console.error("Vercel API error:", vercelData);

      return res.status(500).json({
        error: vercelData.error?.message || "Deployment failed"
      });
    }

    return res.status(200).json({
      deploymentId: vercelData.id,
      status: vercelData.readyState,
      url: vercelData.url
    });

  } catch (err) {

    console.error("Deploy crash:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });

  }
}
