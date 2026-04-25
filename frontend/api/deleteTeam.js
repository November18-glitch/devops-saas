import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ✅ FIX: accept POST (matches your frontend)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ error: "Missing teamId" });
  }

  try {
    // 🔥 1. DELETE TEAM MEMBERS FIRST (avoids FK error)
    const { error: membersError } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId);

    if (membersError) {
      console.error("❌ Members delete error:", membersError);
      return res.status(500).json({ error: "Failed to delete team members" });
    }

    // 🔥 2. DELETE PROJECTS
    const { error: projectsError } = await supabase
      .from("projects")
      .delete()
      .eq("team_id", teamId);

    if (projectsError) {
      console.error("❌ Projects delete error:", projectsError);
      return res.status(500).json({ error: "Failed to delete projects" });
    }

    // 🔥 3. DELETE TEAM
    const { error: teamError } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (teamError) {
      console.error("❌ Team delete error:", teamError);
      return res.status(500).json({ error: "Failed to delete team" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("💥 DELETE TEAM CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}