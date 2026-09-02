import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        flexShrink: 0,
        background: "linear-gradient(180deg, #08080a, #0d0d0f)",
        borderRight: "1px solid var(--border)",
        color: "var(--text)",
        padding: 20,
      }}
    >
      <h3
        style={{
          margin: "0 0 28px",
          color: "var(--text)",
          fontSize: 19,
        }}
      >
        LaunchAlly
      </h3>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/projects" label="Projects" />
        <NavItem to="/profile" label="Profile" />
        <NavItem
          to="/profile-settings"
          label="Profile Settings"
        />
      </nav>
    </aside>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "11px 13px",
        borderRadius: 9,
        textDecoration: "none",
        color: isActive ? "#fff" : "var(--muted)",
        background: isActive
          ? "rgba(124,58,237,0.16)"
          : "transparent",
        border: isActive
          ? "1px solid rgba(124,58,237,0.3)"
          : "1px solid transparent",
        fontWeight: isActive ? 650 : 500,
      })}
    >
      {label}
    </NavLink>
  );
}