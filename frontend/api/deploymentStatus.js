export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { deploymentId } = req.query;

    if (!deploymentId) {
      return res.status(400).json({
        error: "deploymentId required",
      });
    }

    const vercelRes = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    const text = await vercelRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Status NON-JSON:", text);
      return res.status(500).json({
        error: "Invalid Vercel response",
      });
    }

    if (!vercelRes.ok) {
      return res.status(500).json({
        error: data.error?.message || "Status fetch failed",
      });
    }

    return res.status(200).json({
      status: data.readyState,
      url: data.url,
    });

  } catch (err) {
    console.error("STATUS CRASH:", err);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}