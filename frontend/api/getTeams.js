import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔥 ONLY TEAMS USER BELONGS TO
    const { data, error } = await supabase
      .from("team_members")
      .select("teams(*)")
      .eq("user_id", user.id);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch teams" });
    }

    const teams = data.map((t) => t.teams);

    return res.status(200).json({ teams });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}