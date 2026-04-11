import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  const { data } = await supabase
    .from("users")
    .select("plan")
    .eq("id", id)
    .single();

  res.status(200).json({ plan: data?.plan || "FREE" });
}