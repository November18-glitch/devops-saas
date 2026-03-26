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

    const { data, error } = await supabase
      .from("deployments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch deployments" });
    }

    return res.status(200).json({ deployments: data });

  } catch (err) {
    console.error("GET DEPLOYMENTS CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}