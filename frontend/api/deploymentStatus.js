export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { deploymentId } = req.query;

    if (!deploymentId) {
      return res.status(400).json({
        error: "deploymentId is required",
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
      console.error("Vercel status error:", data);

      return res.status(500).json({
        error: "Failed to fetch deployment status",
        details: data,
      });
    }

    return res.status(200).json({
      status: data.readyState, // BUILDING, READY, ERROR
      url: data.url,
    });
  } catch (err) {
    console.error("Status crash:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}