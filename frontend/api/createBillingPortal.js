import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

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

  const customerList = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  if (!customerList.data.length) {
    return res.status(404).json({
      error: "No Stripe customer found.",
    });
  }

  const session =
    await stripe.billingPortal.sessions.create({
      customer: customerList.data[0].id,

      return_url:
        "https://launchally.org/profile-settings",
    });

  res.json({
    url: session.url,
  });
}