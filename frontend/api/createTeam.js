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


const { name, userId, email } = req.body;

if (!name || !userId) {
  return res.status(400).json({ error: "Missing name or userId" });
}

// ✅ Create team WITH owner_id
const { data: team, error: teamError } = await supabase
  .from("teams")
  .insert({
    name,
    owner_id: userId,
  })
  .select()
  .single();

if (teamError) {
  console.error("❌ Team error:", teamError);
  return res.status(500).json({ error: "Failed to create team" });
}

// ✅ Add creator as owner in members
const { error: memberError } = await supabase
  .from("team_members")
  .insert({
    team_id: team.id,
    user_id: userId,
    email: email || null,
    role: "owner",
    status: "active",
  });

if (memberError) {
  console.error("❌ Member error:", memberError);
  return res.status(500).json({ error: "Failed to add member" });
}

return res.status(200).json({ team });


} catch (err) {
console.error("CREATE TEAM ERROR:", err);
return res.status(500).json({ error: "Internal server error" });
}
}
