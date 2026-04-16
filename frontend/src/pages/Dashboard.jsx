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

  useEffect(() => {
    loadDashboard();
  }, []);

  // ----------------------------------
  // LOAD DATA
  // ----------------------------------

  const loadDashboard = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    console.log("USER:", user);

    if (!user) {
      setLoading(false);
      return;
    }

    // 🔥 IMPORTANT: REMOVE .single() (this was breaking you)
    const { data: tmList, error: tmError } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", user.id);

    console.log("TEAM MEMBERS:", tmList, tmError);

    if (!tmList || tmList.length === 0) {
      setLoading(false);
      return;
    }

    const teamId = tmList[0].team_id;

    console.log("TEAM ID:", teamId);

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

    console.log("TEAM:", teamData);
    console.log("PROJECTS:", projectsData);

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

      console.log("DEPLOYMENTS:", deployData);

      setDeployments(deployData || []);
    }

    setLoading(false);
  };

  // ----------------------------------
  // STRIPE
  // ----------------------------------

  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
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
        <h1>
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

        {/* 🔥 UPGRADE BUTTON */}
        {!isPro && (
          <button
            onClick={handleCheckout}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 8,
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🚀 Upgrade to Pro
          </button>
        )}

        {/* SUCCESS */}
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
            🔥 You are now PRO!
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

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        {/* DEPLOYMENTS */}
        <div style={cardStyle}>
          <h3>Recent Deployments</h3>

          {deployments.length === 0 && (
            <div>No deployments yet 🚀</div>
          )}

          {deployments.map((d) => (
            <div key={d.id} style={itemStyle}>
              <div>{d.status}</div>
              <div>{new Date(d.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* PROJECTS */}
        <div style={cardStyle}>
          <h3>Projects</h3>

          {projects.length === 0 && <div>No projects yet 🚀</div>}

          {projects.map((p) => (
            <div key={p.id} style={itemStyle}>
              <div>{p.name}</div>
              <div>{p.default_branch || "main"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      <div>{label}</div>
      <div style={{ fontSize: 28 }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
};

const itemStyle = {
  padding: 10,
  borderBottom: "1px solid #eee",
};