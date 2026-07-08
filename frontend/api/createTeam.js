import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

    const { data: userPlan } = await supabase
  .from("users")
  .select("plan")
  .eq("id", user.id)
  .single();

if ((userPlan?.plan || "FREE") === "FREE") {

  const { count } = await supabase
    .from("teams")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("owner_id", user.id);

  if (count >= 1) {
    return res.status(403).json({
      error: "Free plan allows only one team.",
    });
  }
}

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing name" });
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Failed to create team" });

    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      email: user.email,
      role: "owner",
      status: "active",
    });

    return res.status(200).json({ team });

  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
}