import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const location = useLocation();
  const isPro = location.search.includes("success=true");

  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // LOAD DASHBOARD DATA
  // ----------------------------------

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    // Get team
    const { data: tm } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", auth.user.id)
      .single();

    if (!tm) {
      setLoading(false);
      return;
    }

    const teamId = tm.team_id;

    const [{ data: teamData }, { data: projectsData }, { data: membersData }] =
      await Promise.all([
        supabase.from("teams").select("*").eq("id", teamId).single(),
        supabase
          .from("projects")
          .select("*")
          .eq("team_id", teamId)
          .order("created_at", { ascending: false }),
        supabase
          .from("team_members")
          .select("id")
          .eq("team_id", teamId),
      ]);

    setTeam(teamData);
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

  // ----------------------------------
  // UI
  // ----------------------------------

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 6 }}>
          Welcome back 👋
          {isPro && (
            <span
              style={{
                background: "gold",
                padding: "4px 10px",
                borderRadius: "8px",
                marginLeft: 10,
                fontSize: 14,
              }}
            >
              PRO
            </span>
          )}
        </h1>

        <div style={{ opacity: 0.7, marginBottom: 10 }}>
          Team: <b>{team?.name || "—"}</b>
        </div>

        <p style={{ maxWidth: 600, opacity: 0.8 }}>
          DeployAlly lets you manage deployments, monitor projects, and
          collaborate with your team — all in one place.
        </p>

        {/* PRO SUCCESS MESSAGE */}
        {isPro && (
          <div
            style={{
              background: "#d1fae5",
              padding: "12px",
              borderRadius: "10px",
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            🔥 You are now PRO! Enjoy unlimited deployments.
          </div>
        )}
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Deployments" value={deployments.length} />
        <StatCard label="Team Members" value={membersCount} />
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        {/* DEPLOYMENTS */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: 16 }}>Recent Deployments</h3>

          {deployments.length === 0 && (
            <div style={{ opacity: 0.6 }}>
              No deployments yet — deploy your first project 🚀
            </div>
          )}

          {deployments.map((d) => (
            <div key={d.id} style={itemStyle}>
              <div style={{ fontWeight: 600 }}>
                {d.status.toUpperCase()}
              </div>

              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {new Date(d.created_at).toLocaleString()}
              </div>

              <div style={{ fontSize: 14, marginTop: 4 }}>
                {d.logs || "No logs"}
              </div>
            </div>
          ))}
        </div>

        {/* PROJECTS */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: 16 }}>Projects</h3>

          {projects.length === 0 && (
            <div style={{ opacity: 0.6 }}>
              No projects yet — create one to get started 🚀
            </div>
          )}

          {projects.map((p) => (
            <div key={p.id} style={itemStyle}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>

              <div style={{ fontSize: 13, opacity: 0.7 }}>
                Branch: {p.default_branch || "main"}
              </div>

              <div style={{ fontSize: 13 }}>
                Repo:{" "}
                {p.repo_url ? (
                  <span style={{ color: "#10b981" }}>connected</span>
                ) : (
                  <span style={{ color: "#ef4444" }}>not connected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------
// COMPONENTS
// ----------------------------------

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#f4f6fb",
        padding: 20,
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  padding: 20,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
};

const itemStyle = {
  padding: 12,
  borderRadius: 8,
  background: "#f9fafb",
  marginBottom: 10,
  border: "1px solid #e5e7eb",
};