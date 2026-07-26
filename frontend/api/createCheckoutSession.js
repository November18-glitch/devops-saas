console.log("=== NEW CHECKOUT FILE ===");
import Stripe from "stripe";

export default async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("BODY:", req.body);
    console.log("RAW REQ:", Object.keys(req));


    const body =
  typeof req.body === "string"
    ? JSON.parse(req.body)
    : req.body;

const { email } = body;
    const session = await stripe.checkout.sessions.create({
  mode: "subscription",

  customer_email: email,

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

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}