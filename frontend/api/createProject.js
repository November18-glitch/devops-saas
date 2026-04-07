import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, repoUrl, teamId } = req.body;

    if (!name || !repoUrl || !teamId) {
      return res.status(400).json({
        error: "Missing name, repoUrl or teamId",
      });
    }

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        repo_url: repoUrl,
        repo_type: "github",
        default_branch: "main",
        team_id: teamId,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Project error:", error);
      return res.status(500).json({ error: "Failed to create project" });
    }

    return res.status(200).json({ project: data });

  } catch (err) {
    console.error("CREATE PROJECT CRASH:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}