import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        background: "linear-gradient(180deg, #020617, #0f172a)",
        color: "white",
        padding: 20,
      }}
    >
      <h3>LaunchAlly</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "space-between" }}>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/profile-settings">Profile Settings</NavLink>
      </nav>
    </aside>
  );
}

<div style={{
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  padding: 16,
  borderRadius: 14,
  marginTop: 20
}}>
  <div style={{ fontWeight: 600, marginBottom: 6 }}>
    Upgrade to Pro
  </div>
  <div style={{ fontSize: 12, opacity: 0.9 }}>
    Unlimited deployments + domains
  </div>
  <button style={{
    marginTop: 10,
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "white",
    color: "#6366f1",
    fontWeight: 600,
    cursor: "pointer"
  }}>
    Upgrade Now
  </button>
</div>