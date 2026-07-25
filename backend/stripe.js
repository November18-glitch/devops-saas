import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe("sk_test_YOUR_NEW_KEY");

app.post("/createCheckoutSession", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: "price_YOUR_PRICE_ID",
        quantity: 1,
      },
    ],
    success_url: "http://localhost:5173/success",
    cancel_url: "http://localhost:5173/cancel",
  });

  res.json({ url: session.url });
});

app.listen(4242, () => console.log("Stripe running"));