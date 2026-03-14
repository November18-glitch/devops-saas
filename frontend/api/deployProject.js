export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName are required",
      });
    }

    // Convert GitHub URL to repo format
    // example: https://github.com/user/repo -> user/repo
    const repo = repoUrl
      .replace("https://github.com/", "")
      .replace(".git", "");

    const vercelResponse = await fetch(
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
            repo: repo,
          },
        }),
      }
    );

    const data = await vercelResponse.json();

    // If Vercel returned error
    if (!vercelResponse.ok) {
      console.error("Vercel API error:", data);
      return res.status(500).json({
        error: data.error?.message || "Vercel deployment failed",
      });
    }

    // Ensure deployment id exists
    if (!data.id) {
      return res.status(500).json({
        error: "Deployment ID missing from Vercel response",
      });
    }

    return res.status(200).json({
      deploymentId: data.id,
      status: data.readyState,
      url: data.url,
    });

  } catch (error) {
    console.error("Deploy API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}
