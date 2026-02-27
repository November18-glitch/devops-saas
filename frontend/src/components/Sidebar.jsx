import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        background: "#f6f6f6",
        padding: 20,
      }}
    >
      <h3>My SaaS</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/profile-settings">Profile Settings</NavLink>
      </nav>
    </aside>
  );
}

