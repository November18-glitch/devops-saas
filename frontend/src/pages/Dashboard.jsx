import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const location = useLocation();
  const isPro = location.search.includes("success=true");

  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: tmList } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", user.id);

    if (!tmList || tmList.length === 0) {
      setLoading(false);
      return;
    }

    const teamIds = tmList.map((t) => t.team_id);

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .in("id", teamIds);

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .in("team_id", teamIds)
      .order("created_at", { ascending: false });

    const { data: membersData } = await supabase
      .from("team_members")
      .select("id")
      .in("team_id", teamIds);

    setTeam(teamsData || []);
    setProjects(projectsData || []);
    setMembersCount(membersData?.length || 0);

    if (projectsData?.length) {
      const projectIds = projectsData.map((p) => p.id);

      const { data: deployData } = await supabase
        .from("deployments")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(5);

      setDeployments(deployData || []);
    }

    setLoading(false);
  };

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, sans-serif" }}>
      
      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2 style={{ marginBottom: 30 }}>🚀 DeployAlly</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={navItem}>Dashboard</span>
          <span style={navItem}>Teams</span>
          <span style={navItem}>Projects</span>
          <span style={navItem}>Settings</span>
        </nav>

        <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.6 }}>
          DevOps SaaS Platform
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>
        
        {/* HEADER */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            Welcome back 👋
            {isPro && <span style={proBadge}>PRO</span>}
          </h1>

          <div style={{ color: "#64748b", marginBottom: 10 }}>
            Teams: <b>{team.map((t) => t.name).join(", ") || "—"}</b>
          </div>

          <p style={{ maxWidth: 600, color: "#475569" }}>
            Manage deployments, monitor your infrastructure, and collaborate with your team — all in one place.
          </p>

          {!isPro && (
            <button onClick={handleCheckout} style={upgradeBtn}>
              🚀 Upgrade to Pro — Unlock Unlimited Deployments
            </button>
          )}

          {isPro && (
            <div style={successBox}>
              🔥 You are now PRO — unlimited deployments unlocked
            </div>
          )}
        </div>

        {/* STATS */}
        <div style={grid}>
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Deployments" value={deployments.length} />
          <StatCard label="Team Members" value={membersCount} />
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const sidebar = {
  width: 240,
  background: "#0f172a",
  color: "white",
  padding: 20,
  display: "flex",
  flexDirection: "column",
};

const main = {
  flex: 1,
  padding: 40,
  background: "#f8fafc",
};

const navItem = {
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  opacity: 0.9,
};

const upgradeBtn = {
  marginTop: 20,
  padding: "12px 18px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
};

const proBadge = {
  marginLeft: 10,
  background: "#facc15",
  color: "#000",
  padding: "4px 10px",
  borderRadius: 8,
  fontSize: 12,
};

const successBox = {
  marginTop: 16,
  padding: 12,
  background: "#dcfce7",
  borderRadius: 10,
  color: "#166534",
  fontWeight: 500,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
};

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}