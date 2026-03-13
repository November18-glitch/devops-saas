export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { repoUrl, projectName } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl missing" });
    }

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: {
          type: "github",
          repo: repoUrl.replace("https://github.com/", ""),
        },
      }),
    });

    const data = await response.json();

    return res.status(200).json({
      deploymentId: data.id,
      status: data.readyState,
      url: data.url,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}