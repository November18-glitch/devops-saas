export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName, branch } = req.body;

    if (!repoUrl || !projectName) {
      return res.status(400).json({
        error: "repoUrl and projectName are required",
      });
    }

    // convert github url → repo format
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
            ref: branch || "main"   // 🔥 REQUIRED
          }

        }),
      }
    );

    const data = await vercelResponse.json();

    if (!vercelResponse.ok) {
      console.error("Vercel error:", data);
      return res.status(500).json({
        error: data.error?.message || "Deployment failed",
      });
    }

    return res.status(200).json({
      deploymentId: data.id,
      status: data.readyState,
      url: data.url,
    });

  } catch (err) {
    console.error("Deploy API error:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}
