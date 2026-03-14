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

    // convert repo url → owner/repo
    const repoPath = repoUrl
      .replace("https://github.com/", "")
      .replace(".git", "");

    // -----------------------------
    // 1. Get GitHub repository ID
    // -----------------------------

    const githubRes = await fetch(
      `https://api.github.com/repos/${repoPath}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
        }
      }
    );

    const githubData = await githubRes.json();

    if (!githubRes.ok) {
      console.error("GitHub error:", githubData);

      return res.status(500).json({
        error: "Failed to fetch GitHub repo"
      });
    }

    const repoId = githubData.id;

    // -----------------------------
    // 2. Create Vercel deployment
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

          name: projectName,

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
        error: vercelData.error?.message || "Deployment failed"
      });

    }

    return res.status(200).json({

      deploymentId: vercelData.id,
      status: vercelData.readyState,
      url: vercelData.url

    });

  } catch (err) {

    console.error("Deploy API error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });

  }

}
