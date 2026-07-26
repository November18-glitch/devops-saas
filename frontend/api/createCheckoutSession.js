import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(req.headers.authorization);

const token =
  req.headers.authorization?.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer_email: user.email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url:
        "https://launchally.org/dashboard?success=true",

      cancel_url:
        "https://launchally.org/dashboard?canceled=true",
    });

    return res.status(200).json({
      url: session.url,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
}