import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

      // AUTO ONBOARDING
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

      const { data: deploymentsData } = await supabase
       .from("deployments")
       .select("*")
       .order("created_at", {
       ascending: false,
       });

setDeployments(
  deploymentsData || []
);

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
        <div style={loadingCard}>
          <div style={loadingSpinner}></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const hasProjects = projects.length > 0;
  const sampleProject = projects[0];
  const firstTeam = team[0];

  return (
    <div style={container}>
      <div style={main}>

        {/* HERO */}
        <div style={heroCard}>
          <div style={heroTop}>
            <div style={{ flex: 1 }}>
              <div style={welcomeRow}>
                <h1 style={heroTitle}>
                  Welcome back 👋
                </h1>

                {isPro && (
                  <div style={proBadge}>
                    PRO
                  </div>
                )}
              </div>

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
          </div>

          {!isPro ? (
            <button
              onClick={handleCheckout}
              style={upgradeBtn}
            >
              🚀 Upgrade to Pro
            </button>
          ) : (
            <div style={successBox}>
              🔥 Unlimited deployments unlocked
            </div>
          )}
        </div>

        {/* SIMPLE WORKFLOW */}
        <div style={workflowCard}>
          <div style={workflowHeader}>
            <h2 style={workflowTitle}>
              How DeployAlly Works
            </h2>

            <p style={workflowSubtitle}>
              Simple workflow from team setup to live deployment.
            </p>
          </div>

          <div style={workflowGrid}>
            <div style={workflowStep}>
              <div style={stepNumber}>
                1
              </div>

              <div style={stepContent}>
                <h3 style={stepTitle}>
                  Create or Join a Team
                </h3>

                <p style={stepText}>
                  Every project belongs to a team workspace.
                  Teams help organize deployments and collaboration.
                </p>
              </div>
            </div>

            <div style={workflowArrow}>
              →
            </div>

            <div style={workflowStep}>
              <div style={stepNumber}>
                2
              </div>

              <div style={stepContent}>
                <h3 style={stepTitle}>
                  Add a Project
                </h3>

                <p style={stepText}>
                  Connect a GitHub repository and configure your app.
                </p>
              </div>
            </div>

            <div style={workflowArrow}>
              →
            </div>

            <div style={workflowStep}>
              <div style={stepNumber}>
                3
              </div>

              <div style={stepContent}>
                <h3 style={stepTitle}>
                  Deploy Instantly
                </h3>

                <p style={stepText}>
                  Launch deployments and monitor them live from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {firstTeam && (
            <div style={workspaceNotice}>
              ✅ Your workspace has already been prepared automatically with:
              <br />
              <b>{firstTeam.name}</b> + sample project
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        {hasProjects && (
          <div style={quickStartBox}>
            <div style={quickStartTop}>
              <div>
                <h2 style={quickTitle}>
                  🚀 Quick Start
                </h2>

                <p style={quickText}>
                  Jump directly into your sample workspace or manage all projects.
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
                Open Workspace
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
          <StatCard
            label="Projects"
            value={projects.length}
            emoji="📦"
          />

          <StatCard
            label="Deployments"
            value={deployments.length}
            emoji="🚀"
          />

          <StatCard
            label="Team Members"
            value={membersCount}
            emoji="👥"
          />
        </div>

        {/* DEPLOYMENTS */}
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <div>
              <h3 style={deploymentsTitle}>
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
              <div style={emptyEmoji}>
                🚀
              </div>

              <h3 style={{ marginBottom: 10 }}>
                No deployments yet
              </h3>

              <p style={emptyText}>
                Open your workspace and deploy the sample project.
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
  background: "#f8fafc",
  minHeight: "100vh",
  padding: "32px",
  fontFamily: "Inter, sans-serif",
};

const main = {
  maxWidth: 1200,
  margin: "0 auto",
};

const loadingContainer = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
};

const loadingCard = {
  background: "white",
  padding: "30px 40px",
  borderRadius: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  display: "flex",
  alignItems: "center",
  gap: 14,
  fontWeight: 600,
};

const loadingSpinner = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: "3px solid #c7d2fe",
  borderTop: "3px solid #6366f1",
};

const heroCard = {
  background: "white",
  borderRadius: 28,
  padding: 32,
  marginBottom: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const heroTop = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const welcomeRow = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  marginBottom: 10,
};

const heroTitle = {
  fontSize: 36,
  margin: 0,
  fontWeight: 800,
};

const heroSubtitle = {
  color: "#475569",
  lineHeight: 1.7,
  maxWidth: 720,
  fontSize: 16,
  marginBottom: 14,
};

const teamText = {
  color: "#64748b",
  fontSize: 15,
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
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15,
};

const successBox = {
  marginTop: 24,
  padding: 14,
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 12,
  fontWeight: 600,
};

const workflowCard = {
  background: "white",
  borderRadius: 24,
  padding: 30,
  marginBottom: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const workflowHeader = {
  marginBottom: 26,
};

const workflowTitle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 26,
};

const workflowSubtitle = {
  margin: 0,
  color: "#64748b",
};

const workflowGrid = {
  display: "flex",
  alignItems: "stretch",
  gap: 16,
  flexWrap: "wrap",
};

const workflowStep = {
  flex: 1,
  minWidth: 240,
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 22,
  display: "flex",
  gap: 18,
  background: "#fafcff",
};

const workflowArrow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  color: "#94a3b8",
  fontWeight: 700,
};

const stepNumber = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#6366f1",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  flexShrink: 0,
};

const stepContent = {
  flex: 1,
};

const stepTitle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 17,
};

const stepText = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.6,
};

const workspaceNotice = {
  marginTop: 24,
  background: "#eef2ff",
  color: "#4338ca",
  padding: 18,
  borderRadius: 16,
  lineHeight: 1.7,
};

const quickStartBox = {
  background: "white",
  borderRadius: 24,
  padding: 30,
  marginBottom: 28,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const quickStartTop = {
  marginBottom: 22,
};

const quickTitle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 24,
};

const quickText = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.6,
};

const quickButtons = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
};

const primaryAction = {
  padding: "14px 20px",
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const secondaryAction = {
  padding: "14px 20px",
  background: "#eef2ff",
  color: "#4338ca",
  border: "1px solid #c7d2fe",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 28,
};

const statCard = {
  background: "white",
  padding: 26,
  borderRadius: 22,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const statTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const statEmoji = {
  fontSize: 24,
};

const statLabel = {
  color: "#64748b",
  fontSize: 14,
};

const statValue = {
  fontSize: 36,
  fontWeight: 800,
};

const tableWrapper = {
  background: "white",
  borderRadius: 24,
  padding: 30,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 26,
};

const deploymentsTitle = {
  margin: 0,
  marginBottom: 6,
};

const tableSubtext = {
  margin: 0,
  color: "#64748b",
};

const viewAllBtn = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid #dbeafe",
  background: "#f8fafc",
  cursor: "pointer",
  fontWeight: 700,
};

const deploymentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const deploymentCard = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 20,
};

const deploymentTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 16,
  flexWrap: "wrap",
};

const projectName = {
  fontWeight: 700,
  fontSize: 17,
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
  gap: 16,
  flexWrap: "wrap",
};

const environmentTag = {
  background: "#eef2ff",
  color: "#4338ca",
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
};

const emptyState = {
  textAlign: "center",
  padding: "50px 20px",
};

const emptyEmoji = {
  fontSize: 44,
  marginBottom: 14,
};

const emptyText = {
  color: "#64748b",
  marginBottom: 20,
};

const viewBtn = {
  padding: "10px 14px",
  background: "#6366f1",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
};

const statusBadge = (status) => ({
  padding: "7px 12px",
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

function StatCard({ label, value, emoji }) {
  return (
    <div style={statCard}>
      <div style={statTop}>
        <div style={statLabel}>
          {label}
        </div>

        <div style={statEmoji}>
          {emoji}
        </div>
      </div>

      <div style={statValue}>
        {value}
      </div>
    </div>
  );
}