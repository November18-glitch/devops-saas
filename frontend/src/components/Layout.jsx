import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

import Header from "./Header";
import logo from "../assets/logo.png";

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ FIXED PRO BUTTON
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/createCheckoutSession", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          background: "#6366f1",
          padding: 24,
          boxSizing: "border-box",
          color: "white",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* LOGO + NAME */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 30,
          }}
        >
          <img
            src={logo}
            alt="LaunchAlly Logo"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
            }}
          />

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            LaunchAlly
          </h2>
        </div>

        <p
          style={{
            fontWeight: "bold",
            marginBottom: 10,
            opacity: 0.7,
          }}
        >
          Main Menu
        </p>

        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/teams" label="Teams" />
        <NavItem to="/projects" label="Projects" />
        <NavItem to="/profile-settings" label="Profile Settings" />

        {/* 🔥 PRO CARD */}
        <div
          style={{
            marginTop: 40,
            background: "rgba(255,255,255,0.12)",
            padding: 18,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 8,
              fontSize: 16,
            }}
          >
            LaunchAllyPro
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.85,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            Unlock unlimited deployments and premium features.
          </div>

          <button
            onClick={handleUpgrade}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "none",
              borderRadius: 10,
              background: "white",
              color: "#1b1b1b",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div style={{ flex: 1, background: "#fff" }}>
        
        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <div style={{ padding: 30 }}>
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
        padding: "12px 16px",
        marginBottom: 10,
        background: isActive ? "#1e293b" : "transparent",
        textDecoration: "none",
        color: "white",
        borderRadius: 6,
      })}
    >
      {label}
    </NavLink>
  );
}