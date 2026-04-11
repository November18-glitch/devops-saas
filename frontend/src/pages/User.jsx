import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("FREE");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      // 🔥 get plan from DB
      if (data.user) {
        const res = await fetch(`/api/getUserPlan?id=${data.user.id}`);
        const dataPlan = await res.json();
        setPlan(dataPlan.plan || "FREE");
      }
    };

    loadUser();
  }, []);

  // 💳 STRIPE UPGRADE
  const handleUpgrade = async () => {
    if (!user) return;

    const res = await fetch("/api/createCheckoutSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      {/* USER INFO */}
      <div style={{ marginTop: "20px" }}>
        <p><b>Email:</b> {user?.email}</p>
        <p>
          <b>Plan:</b>{" "}
          <span style={{ color: plan === "PRO" ? "green" : "gray" }}>
            {plan}
          </span>
        </p>
      </div>

      {/* 🔥 UPGRADE BUTTON */}
      {plan === "FREE" && (
        <button
          onClick={handleUpgrade}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          💳 Upgrade to Pro
        </button>
      )}

      {plan === "PRO" && (
        <p style={{ marginTop: "20px", color: "green" }}>
          ✅ You are a PRO user
        </p>
      )}
    </div>
  );
}