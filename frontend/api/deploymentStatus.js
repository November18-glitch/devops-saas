import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Deployment ID is required",
      });
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
      return res.status(200).json({
        status: "ERROR",
      });
    }

    let status = "BUILDING";

    if (data.readyState === "READY") status = "READY";
    else if (data.readyState === "ERROR") status = "ERROR";

    // ✅ FIXED UPDATE (WITH ERROR LOGGING)
    const { error } = await supabase
      .from("deployments")
      .update({ status })
      .eq("deployment_id", id);

    if (error) {
      console.error("❌ Supabase update error:", error);
    }

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