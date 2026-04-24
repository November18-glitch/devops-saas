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

    const { name, repoUrl, teamId, userId } = req.body;

    if (!name || !repoUrl || !teamId || !userId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // 🔥 GET USER PLAN (SAFE VERSION)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .maybeSingle(); // ✅ THIS FIXES YOUR CRASH

    if (userError) {
      console.error("User fetch error:", userError);
      return res.status(500).json({ error: "User lookup failed" });
    }

    // 🔥 DEFAULT PLAN IF USER NOT FOUND
    const userPlan = user?.plan || "FREE";

    // 🔥 FREE PLAN LIMIT
    if (userPlan === "FREE") {
      const { count, error: countError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("team_id", teamId);

      if (countError) {
        console.error("Count error:", countError);
        return res.status(500).json({ error: "Failed to check limits" });
      }

      if (count >= 1) {
        return res.status(403).json({
          error: "Free plan allows only 1 project. Upgrade to Pro.",
        });
      }
    }

    // 🔥 VALIDATE GITHUB URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    // 🔥 CREATE PROJECT
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