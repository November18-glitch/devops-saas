import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

import Header from "./Header";
import logo from "../assets/logo.png";
import "../styles/app.css";

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("FREE");

  useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();

    setPlan(data?.plan || "FREE");
  }

  loadUser();
}, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ FIXED PRO BUTTON
  const handleUpgrade = async () => {
  try {
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
      console.error(data);
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
};

  return (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
    }}
  >
    {/* SIDEBAR */}
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        background: "linear-gradient(180deg, #08080a 0%, #0d0d0f 100%)",
        borderRight: "1px solid var(--border)",
        padding: 22,
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* LOGO + NAME */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 34,
        }}
      >
        <img
          src={logo}
          alt="LaunchAlly Logo"
          style={{
            width: 38,
            height: 38,
            objectFit: "contain",
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 750,
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          LaunchAlly
        </h2>
      </div>

      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--muted)",
          margin: "0 0 12px",
        }}
      >
        Main Menu
      </p>

      <NavItem to="/dashboard" label="Dashboard" />
      <NavItem to="/teams" label="Teams" />
      <NavItem to="/projects" label="Projects" />
      <NavItem to="/profile-settings" label="Profile Settings" />

      {/* PRO CARD */}
      <div
        style={{
          marginTop: "auto",
          background:
            "linear-gradient(145deg, rgba(124,58,237,0.16), rgba(99,102,241,0.08))",
          border: "1px solid rgba(124,58,237,0.35)",
          padding: 18,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 8,
            fontSize: 16,
            color: "var(--text)",
          }}
        >
          LaunchAlly Pro
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          Unlock unlimited deployments and premium features.
        </div>

        {plan === "PRO" ? (
          <div
            style={{
              textAlign: "center",
              fontWeight: 700,
              background: "var(--success-bg)",
              border: "1px solid #14532d",
              color: "#86efac",
              padding: 10,
              borderRadius: 10,
            }}
          >
            ✓ You're Pro
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid rgba(139,92,246,0.5)",
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--accent-2), var(--accent))",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(99,102,241,0.2)",
            }}
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </aside>

    {/* MAIN AREA */}
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <Header />

      <div
        style={{
          padding: 30,
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  </div>
);
}
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "block",
        padding: "11px 13px",
        marginBottom: 6,
        background: isActive
          ? "linear-gradient(90deg, rgba(124,58,237,0.2), rgba(99,102,241,0.08))"
          : "transparent",
        border: isActive
          ? "1px solid rgba(124,58,237,0.28)"
          : "1px solid transparent",
        textDecoration: "none",
        color: isActive ? "#ffffff" : "var(--muted)",
        borderRadius: 9,
        fontSize: 14,
        fontWeight: isActive ? 650 : 500,
      })}
    >
      {label}
    </NavLink>
  );
}