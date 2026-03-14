export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, branch } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName are required"
      });
    }

    // -----------------------------
    // Clean GitHub repo URL
    // -----------------------------

    let repoPath = repoUrl
      .replace("https://github.com/", "")
      .replace("http://github.com/", "")
      .replace(".git", "")
      .trim();

    if (repoPath.endsWith("/")) {
      repoPath = repoPath.slice(0, -1);
    }

    // Example result:
    // vercel/nextjs-boilerplate

    // -----------------------------
    // Sanitize project name
    // -----------------------------

    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .replace(/---+/g, "-")
      .slice(0, 100);

    // -----------------------------
    // Fetch repo info from GitHub
    // -----------------------------

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub API error:", githubData);

      return res.status(500).json({
        error: "Failed to fetch GitHub repo",
        details: githubData
      });
    }

    const repoId = githubData.id;

    // -----------------------------
    // Create Vercel deployment
    // -----------------------------

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
            ref: branch || "main"
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
      url: vercelData.url

    });

  } catch (err) {

    console.error("Deploy API crash:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });

  }

}
