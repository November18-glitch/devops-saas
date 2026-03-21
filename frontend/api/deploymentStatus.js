export default async function handler(req, res) {
  try {
    // 🚨 disable caching
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { deploymentId } = req.query;

    if (!deploymentId) {
      return res.status(400).json({
        error: "deploymentId required",
      });
    }

    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data?.error?.code === "not_found") {
        return res.status(200).json({
          status: "BUILDING",
        });
      }

      return res.status(500).json({
        error: "Failed to fetch deployment",
        details: data,
      });
    }

    return res.status(200).json({
      status: data.readyState,
      url: data.url,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
