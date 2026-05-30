import { createClient } from "@supabase/supabase-js";

console.log("VITE_SUPABASE_URL =", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY exists =", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);