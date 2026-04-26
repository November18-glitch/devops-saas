import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

import Header from "./Header";
import logo from "../assets/logo.png"; // ✅ IMPORT LOGO

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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          background: "#0f172a",
          padding: 24,
          boxSizing: "border-box",
          color: "white", // ✅ so text is visible on dark bg
        }}
      >
        {/* 🔥 LOGO + NAME */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
          <img
            src={logo}
            alt="DeployAlly Logo"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
            }}
          />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            DeployAlly
          </h2>
        </div>

        <p style={{ fontWeight: "bold", marginBottom: 10, opacity: 0.7 }}>
          Main Menu
        </p>

        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/teams" label="Teams" />
        <NavItem to="/projects" label="Projects" />
        <NavItem to="/profile-settings" label="Profile Settings" />
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
        background: isActive ? "#1e293b" : "transparent", // ✅ better for dark sidebar
        textDecoration: "none",
        color: "white", // ✅ fix visibility
        borderRadius: 6,
      })}
    >
      {label}
    </NavLink>
  );
}