export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, branch } = req.body;

    console.log("RAW repoUrl:", repoUrl);

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName required",
      });
    }

    // -------------------------
    // CLEAN URL
    // -------------------------
    let cleanUrl = repoUrl.trim();
    cleanUrl = cleanUrl.replace(/\.git$/, "");
    cleanUrl = cleanUrl.replace(/\/$/, "");

    const match = cleanUrl.match(
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/
    );

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    const owner = match[1];
    const repo = match[2];
    const repoPath = `${owner}/${repo}`;

    console.log("Parsed repo:", repoPath);

    // -------------------------
    // SAFE NAME
    // -------------------------
    const safeName = projectName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 100);

    // -------------------------
    // GITHUB REQUEST
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

    const githubText = await githubRes.text();

    let githubData;
    try {
      githubData = JSON.parse(githubText);
    } catch {
      console.error("GitHub NON-JSON:", githubText);
      return res.status(500).json({
        error: "GitHub returned invalid response",
      });
    }

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
    // VERCEL DEPLOY
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
            repoId,
            ref: branch || defaultBranch,
          },
          projectSettings: {
            framework: null,
          },
        }),
      }
    );

    const vercelText = await vercelRes.text();

    let vercelData;
    try {
      vercelData = JSON.parse(vercelText);
    } catch {
      console.error("Vercel NON-JSON:", vercelText);
      return res.status(500).json({
        error: "Vercel returned invalid response",
      });
    }

    console.log("Vercel response:", vercelData);

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
    console.error("DEPLOY CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}