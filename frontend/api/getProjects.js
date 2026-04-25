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

    const { teamId } = req.query;

    if (!teamId) {
      console.error("❌ Missing teamId in query");
      return res.status(400).json({ error: "Missing teamId" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Fetch projects error:", error);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }

    console.log("✅ Projects fetched:", data);

    return res.status(200).json({ projects: data });

  } catch (err) {
    console.error("💥 GET PROJECTS CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}