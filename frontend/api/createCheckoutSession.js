import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let raw = "";

    for await (const chunk of req) {
      raw += chunk;
    }

    const { email } = JSON.parse(raw);

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