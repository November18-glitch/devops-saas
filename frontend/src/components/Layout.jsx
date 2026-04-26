import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

import Header from "./Header"; // <-- ADD THIS

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
        }}
      >
        {/* 🔥 LOGO + NAME (ONLY CHANGE) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
          <img
            src="C:\Users\alyse\Downloads\SaaS_logo.png" // 
            alt="DeployAlly Logo"
            style={{ width: 32, height: 32, objectFit: "contain" }}
          />
          <h2 style={{ margin: 0 }}>DeployAlly</h2>
        </div>

        <p style={{ fontWeight: "bold", marginBottom: 10 }}>Main Menu</p>

        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/teams" label="Teams" />
        <NavItem to="/projects" label="Projects" />
        <NavItem to="/profile-settings" label="Profile Settings" />
      </aside>

      {/* MAIN AREA */}
      <div style={{ flex: 1, background: "#fff" }}>
        
        {/* HEADER (REPLACES OLD TOP BAR) */}
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
        background: isActive ? "#fff" : "transparent",
        textDecoration: "none",
        color: "#000",
        borderRadius: 6,
      })}
    >
      {label}
    </NavLink>
  );
}