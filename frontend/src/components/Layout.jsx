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
          background: "#fde4e4",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Logo + SaaS name</h2>

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
