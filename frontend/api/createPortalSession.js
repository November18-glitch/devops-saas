import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {

  const token =
    req.headers.authorization?.replace("Bearer ", "");

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const portal =
    await stripe.billingPortal.sessions.create({

      customer: dbUser.stripe_customer_id,

      return_url:
        "https://launchally.org/profile-settings",

    });

  res.json({
    url: portal.url,
  });
}