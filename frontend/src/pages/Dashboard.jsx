import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

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
        const username =
          user.user_metadata?.username ||
          user.email?.split("@")[0] ||
          "My Team";

        const { data: createdTeam, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: `${username}'s Team`,
            owner_id: user.id,
          })
          .select()
          .single();

        if (!teamError && createdTeam) {
          await supabase.from("team_members").insert({
            team_id: createdTeam.id,
            user_id: user.id,
            email: user.email,
            role: "owner",
            status: "active",
          });

          await supabase.from("projects").insert({
            name: "Sample Next.js App",
            repo_url: "https://github.com/vercel/nextjs-dashboard",
            repo_type: "github",
            default_branch: "main",
            team_id: createdTeam.id,
            env_vars: {},
          });

          return loadDashboard();
        }

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
    return (
      <div style={loadingContainer}>
        Loading dashboard...
      </div>
    );
  }

  const hasProjects = projects.length > 0;
  const sampleProject = projects[0];

  return (
    <div style={container}>
      <div style={main}>

        {/* HERO */}
        <div style={heroCard}>
          <div style={heroTop}>
            <div>
              <h1 style={heroTitle}>
                Welcome back 👋
              </h1>

              <p style={heroSubtitle}>
                Deploy apps, manage teams, and monitor deployments from one clean dashboard.
              </p>

              <div style={teamText}>
                Teams:{" "}
                <b>
                  {team.map((t) => t.name).join(", ") || "—"}
                </b>
              </div>
            </div>

            {isPro && (
              <div style={proBadge}>
                PRO
              </div>
            )}
          </div>

          {!isPro ? (
            <button onClick={handleCheckout} style={upgradeBtn}>
              🚀 Upgrade to Pro
            </button>
          ) : (
            <div style={successBox}>
              🔥 Unlimited deployments unlocked
            </div>
          )}
        </div>

        {/* QUICK START */}
        {hasProjects && (
          <div style={quickStartBox}>
            <div style={quickStartHeader}>
              <div>
                <h2 style={quickTitle}>
                  🚀 Quick Start
                </h2>

                <p style={quickText}>
                  Your workspace is ready. Open projects or deploy your sample app.
                </p>
              </div>
            </div>

            <div style={quickButtons}>
              <button
                style={primaryAction}
                onClick={() =>
                  navigate(`/projects?teamId=${sampleProject.team_id}`)
                }
              >
                Open Projects
              </button>

              <button
                style={secondaryAction}
                onClick={() =>
                  navigate(`/projects/${sampleProject.id}`)
                }
              >
                Open Sample App
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div style={grid}>
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Deployments" value={deployments.length} />
          <StatCard label="Team Members" value={membersCount} />
        </div>

        {/* DEPLOYMENTS */}
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <div>
              <h3 style={{ margin: 0 }}>
                Recent Deployments
              </h3>

              <p style={tableSubtext}>
                Latest deployment activity across your teams
              </p>
            </div>

            <button
              style={viewAllBtn}
              onClick={() => navigate("/projects")}
            >
              View All
            </button>
          </div>

          {deployments.length === 0 ? (
            <div style={emptyState}>
              <div style={{ fontSize: 40 }}>
                🚀
              </div>

              <h3>No deployments yet</h3>

              <p style={{ color: "#64748b" }}>
                Open Projects and deploy your sample app.
              </p>

              <button
                style={primaryAction}
                onClick={() => navigate("/projects")}
              >
                Open Projects
              </button>
            </div>
          ) : (
            <div style={deploymentsList}>
              {deployments.map((d) => (
                <div
                  key={d.deployment_id}
                  style={deploymentCard}
                >
                  <div style={deploymentTop}>
                    <div>
                      <div style={projectName}>
                        {projects.find((p) => p.id === d.project_id)?.name ||
                          "Unknown"}
                      </div>

                      <div style={deployTime}>
                        {new Date(d.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span style={statusBadge(d.status)}>
                      {d.status}
                    </span>
                  </div>

                  <div style={deploymentBottom}>
                    <div style={environmentTag}>
                      {d.environment || "production"}
                    </div>

                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        style={viewBtn}
                      >
                        Open Deployment
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: "32px",
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
};

const main = {
  maxWidth: 1200,
  margin: "0 auto",
};

const loadingContainer = {
  padding: 40,
  fontSize: 18,
};

const heroCard = {
  background: "white",
  borderRadius: 24,
  padding: 32,
  marginBottom: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const heroTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  flexWrap: "wrap",
};

const heroTitle = {
  fontSize: 36,
  margin: 0,
  marginBottom: 12,
};

const heroSubtitle = {
  color: "#475569",
  fontSize: 16,
  maxWidth: 700,
  lineHeight: 1.6,
  marginBottom: 14,
};

const teamText = {
  color: "#64748b",
};

const proBadge = {
  background: "#facc15",
  color: "#000",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

const upgradeBtn = {
  marginTop: 24,
  padding: "14px 22px",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15,
};

const successBox = {
  marginTop: 24,
  padding: 14,
  background: "#dcfce7",
  borderRadius: 12,
  color: "#166534",
  fontWeight: 600,
};

const quickStartBox = {
  background: "white",
  borderRadius: 20,
  padding: 28,
  marginBottom: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const quickStartHeader = {
  marginBottom: 20,
};

const quickTitle = {
  margin: 0,
  marginBottom: 10,
};

const quickText = {
  color: "#64748b",
  margin: 0,
};

const quickButtons = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
};

const primaryAction = {
  padding: "14px 18px",
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryAction = {
  padding: "14px 18px",
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 28,
};

const tableWrapper = {
  background: "white",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
  flexWrap: "wrap",
};

const tableSubtext = {
  color: "#64748b",
  marginTop: 6,
  marginBottom: 0,
};

const viewAllBtn = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid #dbeafe",
  background: "#f8fafc",
  cursor: "pointer",
  fontWeight: 600,
};

const deploymentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const deploymentCard = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 18,
};

const deploymentTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 16,
};

const projectName = {
  fontWeight: 700,
  fontSize: 16,
  marginBottom: 6,
};

const deployTime = {
  color: "#64748b",
  fontSize: 13,
};

const deploymentBottom = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const environmentTag = {
  background: "#eef2ff",
  color: "#4338ca",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
};

const emptyState = {
  textAlign: "center",
  padding: "50px 20px",
};

const viewBtn = {
  padding: "10px 14px",
  background: "#6366f1",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
};

const statusBadge = (status) => ({
  padding: "6px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
  background:
    status === "READY"
      ? "#dcfce7"
      : status === "BUILDING"
      ? "#fef9c3"
      : "#fee2e2",
  color:
    status === "READY"
      ? "#166534"
      : status === "BUILDING"
      ? "#854d0e"
      : "#991b1b",
});

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>
        {label}
      </div>

      <div style={statValue}>
        {value}
      </div>
    </div>
  );
}

const statCard = {
  background: "white",
  padding: 24,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const statLabel = {
  color: "#64748b",
  fontSize: 14,
  marginBottom: 12,
};

const statValue = {
  fontSize: 34,
  fontWeight: 800,
};