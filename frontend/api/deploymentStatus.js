export default async function handler(req, res) {
  try {
    // ✅ Only allow GET
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Deployment ID is required",
      });
    }

    // 🚀 Fetch deployment from Vercel
    const vercelRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
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
      console.error("❌ Non-JSON from Vercel:", text);
      return res.status(500).json({
        status: "ERROR",
      });
    }

    if (!vercelRes.ok) {
      console.error("❌ Vercel API error:", data);

      return res.status(200).json({
        status: "ERROR",
      });
    }

    // ✅ Normalize status (IMPORTANT FOR FRONTEND)
    let status = "BUILDING";

    if (data.readyState === "READY") status = "READY";
    else if (data.readyState === "ERROR") status = "ERROR";

    return res.status(200).json({
      status,
      url: data.url || null,
    });

  } catch (err) {
    console.error("💥 STATUS CRASH:", err);

    return res.status(200).json({
      status: "ERROR",
    });
  }
}