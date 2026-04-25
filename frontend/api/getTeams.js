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

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 🔥 GET TEAMS VIA MEMBERSHIP
    const { data, error } = await supabase
      .from("team_members")
      .select(`
        team_id,
        teams (*)
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Supabase fetch teams error:", error);
      return res.status(500).json({ error: "Failed to fetch teams" });
    }

    // flatten teams
    const teams = data.map(t => t.teams);

    return res.status(200).json({ teams });

  } catch (err) {
    console.error("💥 GET TEAMS CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}