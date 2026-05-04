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
    try {
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

      // ✅ DEPLOYMENTS FETCH (WORKING VERSION)
      let deployData = [];

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map((p) => p.id);

        const { data: byProject } = await supabase
          .from("deployments")
          .select("*")
          .in("project_id", projectIds);

        deployData = byProject || [];
      }

      const { data: byTeam } = await supabase
        .from("deployments")
        .select("*")
        .in("team_id", teamIds);

      const merged = [...(deployData || []), ...(byTeam || [])];

      const unique = Array.from(
        new Map(merged.map((d) => [d.deployment_id, d])).values()
      );

      unique.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setDeployments(unique.slice(0, 5));

    } catch (err) {
      console.error("Dashboard crash:", err);
      setDeployments([]);
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
    <div style={container}>
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
            Deploy faster. Managae everything. Skip the DevOps headaches.
          </p>

          <p style={{ maxWidth: 500, color: "#475569" }}>
            Connect your GitHub repo, deploy in seconds, and manage projects, deployments, and collaboration from one clean dashboard.
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

        {/* 🔥 NEW: RECENT DEPLOYMENTS TABLE */}
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <h3 style={{ margin: 0 }}>Recent Deployments</h3>
            <span style={{ color: "#6366f1", cursor: "pointer" }}>
              View all deployments →
            </span>
          </div>

          {deployments.length === 0 ? (
            <div style={{ padding: 20, color: "#64748b" }}>
              No deployments yet.
            </div>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Environment</th>
                  <th>Deployed At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => (
                  <tr key={d.deployment_id}>
                    <td>{projects.find((p) => p.id === d.project_id)?.name || "Unknown"}</td>
                    <td>
                      <span style={statusBadge(d.status)}>
                        {d.status}
                      </span>
                    </td>
                    <td>{d.environment}</td>
                    <td>
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td>
                      <a
                        href={d.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        style={viewBtn}
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: 40,
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
};

const main = {
  flex: 1,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginBottom: 30,
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
};

const tableWrapper = {
  background: "white",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 16,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const viewBtn = {
  padding: "6px 10px",
  background: "#6366f1",
  color: "white",
  borderRadius: 6,
  textDecoration: "none",
  fontSize: 12,
};

const statusBadge = (status) => ({
  padding: "4px 8px",
  borderRadius: 6,
  background:
    status === "READY" ? "#dcfce7" :
    status === "BUILDING" ? "#fef9c3" :
    "#e2e8f0",
  color: "#000",
  fontSize: 12,
});

function StatCard({ label, value }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}