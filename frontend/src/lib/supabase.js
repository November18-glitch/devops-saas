import { createClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL;

const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL =", url);
console.log("KEY =", key);

export const supabase =
  url && key
    ? createClient(url, key)
    : null;