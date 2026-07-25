import { supabase } from "../lib/supabase";

export default function User() {
  const handleCheckout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const res = await fetch("/api/createCheckoutSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
      }),
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
    <div>
      <h1>LaunchAlly 🚀</h1>
      <p>CI/CD + monitoring + team collaboration</p>

      <button onClick={handleCheckout}>Upgrade to Pro</button>
    </div>
  );
}