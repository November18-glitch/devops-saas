import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 🔥 GET TOKEN FROM HEADER
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 🔥 CREATE CLIENT WITH USER TOKEN
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY, // ⚠️ IMPORTANT: NOT SERVICE ROLE
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 🔥 GET CURRENT USER
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔥 GET TEAMS VIA MEMBERSHIP
    const { data, error } = await supabase
      .from("team_members")
      .select(`
        team_id,
        teams (*)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Fetch teams error:", error);
      return res.status(500).json({ error: "Failed to fetch teams" });
    }

    // 🔥 CLEAN RESPONSE
    const teams = data.map((t) => t.teams);

    return res.status(200).json({ teams });

  } catch (err) {
    console.error("💥 GET TEAMS CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}