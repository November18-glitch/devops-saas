import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string"
        ? Buffer.from(chunk)
        : chunk
    );
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const buf = await buffer(req);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {

    case "checkout.session.completed": {

      const session = event.data.object;

      const customer = await stripe.customers.retrieve(
        session.customer
      );

      const email = customer.email;

      if (!email) break;

      const { error } = await supabase
        .from("users")
        .update({
          plan: "PRO",
        })
        .eq("email", email);

      if (error) {
        console.error(error);
      }

      console.log("User upgraded:", email);

      break;
    }

    case "customer.subscription.deleted": {

      const subscription = event.data.object;

      const customer = await stripe.customers.retrieve(
        subscription.customer
      );

      const email = customer.email;

      if (!email) break;

      await supabase
       .from("users")
       .update({
       plan: "PRO",
       stripe_customer_id: session.customer,
       stripe_subscription_id: session.subscription,
       })
       .eq("email", email);

      console.log("Subscription cancelled:", email);

      break;
    }

    case "customer.subscription.updated": {

      const subscription = event.data.object;

      const customer = await stripe.customers.retrieve(
        subscription.customer
      );

      const email = customer.email;

      if (!email) break;

      const newPlan =
        subscription.status === "active"
          ? "PRO"
          : "FREE";

      await supabase
        .from("users")
        .update({
          plan: newPlan,
        })
        .eq("email", email);

      console.log("Subscription updated:", email);

      break;
    }
  }

  res.json({
    received: true,
  });
}