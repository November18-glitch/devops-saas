import { supabase } from "../lib/supabase";

export default function User() {
  const handleCheckout = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);

    const res = await fetch("/api/createCheckoutSession", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error(data);
      alert(data.error || "Stripe error");
    }
  };

  return (
    <button onClick={handleCheckout}>
      Upgrade to Pro
    </button>
  );
}