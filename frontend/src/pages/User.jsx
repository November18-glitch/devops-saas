import { supabase } from "../lib/supabase";

export default function User() {
  const handleCheckout = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

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