export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { deploymentId } = req.query;

    // 🚨 STOP if invalid
    if (!deploymentId || deploymentId === "undefined") {
      return res.status(400).json({
        error: "Invalid deploymentId",
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

    // 🚨 HANDLE NOT FOUND CLEANLY (NO CRASH)
    if (!response.ok) {
      if (data?.error?.code === "not_found") {
        return res.status(200).json({
          status: "BUILDING",
          note: "Deployment not ready yet",
        });
      }

      console.error("Vercel status error:", data);

      return res.status(500).json({
        error: "Failed to fetch deployment status",
        details: data,
      });
    }

    return res.status(200).json({
      status: data.readyState,
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