import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    const vercelRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    const data = await vercelRes.json();

    if (!vercelRes.ok) {
      return res.status(500).json({ error: "Failed to fetch deployment" });
    }

    let status = "BUILDING";
    let logMessage = "⚙️ Still building...";

    if (data.readyState === "READY") {
      status = "READY";
      logMessage = "✅ Deployment ready!";
    }

    if (data.readyState === "ERROR") {
      status = "ERROR";
      logMessage = "❌ Deployment failed";
    }

    await supabase
      .from("deployments")
      .update({
        status,
        logs: logMessage,
      })
      .eq("deployment_id", id);

    return res.status(200).json({
      status,
      url: data.url,
      logs: logMessage,
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}