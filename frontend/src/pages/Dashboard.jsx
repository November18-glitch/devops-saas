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
      console.log("USER:", user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: tmList } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id);
      console.log("TEAM MEMBERS:", tmList);

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
          const { error: memberError } =
            await supabase.from("team_members").insert({
              team_id: createdTeam.id,
              user_id: user.id,
              email: user.email,
              role: "owner",
              status: "active",
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
      console.log("TEAMS:", teamsData);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .in("team_id", teamIds)
        .order("created_at", { ascending: false });
      console.log("PROJECTS:", projectsData);

      const { data: membersData } = await supabase
        .from("team_members")
        .select("id")
        .in("team_id", teamIds);
      console.log("MEMBERS:", membersData);

      setTeam(teamsData || []);
      setProjects(projectsData || []);
      setMembersCount(membersData?.length || 0);

      const {
        data: deploymentsData,
        error: deploymentsError,
      } = await supabase
        .from("deployments")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      console.log("DEPLOYMENTS:", deploymentsData);
      console.log("DEPLOYMENTS ERROR:", deploymentsError);

      setDeployments(deploymentsData || []);

    } catch (err) {
      console.error("Dashboard crash:", err);
      setDeployments([]);
    } finally {
      setLoading(false);
    }
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

        {/* QUICK START BOX (ONBOARDING) */}
        <div style={quickStartBox}>
          <h2 style={quickStartTitle}>🚀 Getting Started</h2>
          <ol style={quickStartList}>
            <li style={quickStartStep}>Create a Team</li>
            <li style={quickStartStep}>Add a Project</li>
            <li style={quickStartStep}>Connect your GitHub repository</li>
            <li style={quickStartStep}>Deploy your application</li>
          </ol>
          <button
            style={primaryAction}
            onClick={() => navigate("/projects")}
          >
            Create First Project
          </button>
        </div>

        {/* STATS */}
        <div style={grid}>
          <StatCard
            label="Projects"
            value={projects.length}
            emoji="📦"
          />

          <StatCard
            label="Deployments"
            value={deployments?.length || 0}
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
                Create a project to launch your first live application deployment.
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
                          "Unknown Project"}
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
  marginBottom: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
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
  fontSize: 32,
  margin: 0,
  fontWeight: 800,
  color: "#0f172a",
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
  padding: "6px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
};

const upgradeBtn = {
  marginTop: 20,
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 15,
  transition: "opacity 0.2s",
};

const successBox = {
  marginTop: 20,
  padding: 14,
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 12,
  fontWeight: 600,
};

/* QUICK START INTERFACE STYLES */
const quickStartBox = {
  background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: "32px",
  marginBottom: 28,
  boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
};

const quickStartTitle = {
  margin: "0 0 16px 0",
  fontSize: 22,
  fontWeight: 700,
  color: "#0f172a",
};

const quickStartList = {
  margin: "0 0 24px 0",
  paddingLeft: "24px",
  lineHeight: "2.2",
  color: "#334155",
  fontSize: 16,
};

const quickStartStep = {
  fontWeight: 500,
};

const primaryAction = {
  padding: "12px 24px",
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
  marginBottom: 28,
};

const statCard = {
  background: "white",
  padding: 24,
  borderRadius: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  border: "1px solid #f1f5f9",
};

const statTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const statEmoji = {
  fontSize: 22,
  background: "#f8fafc",
  padding: "8px",
  borderRadius: "10px",
};

const statLabel = {
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
};

const statValue = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
};

const tableWrapper = {
  background: "white",
  borderRadius: 24,
  padding: 30,
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  border: "1px solid #f1f5f9",
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
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 4,
};

const tableSubtext = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
};

const viewAllBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  color: "#334155",
};

const deploymentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const deploymentCard = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 18,
  background: "#ffffff",
};

const deploymentTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 14,
  flexWrap: "wrap",
};

const projectName = {
  fontWeight: 700,
  fontSize: 16,
  color: "#0f172a",
  marginBottom: 4,
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
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const emptyState = {
  textAlign: "center",
  padding: "40px 20px",
};

const emptyEmoji = {
  fontSize: 40,
  marginBottom: 12,
};

const emptyText = {
  color: "#64748b",
  marginBottom: 20,
  fontSize: 15,
};

const viewBtn = {
  padding: "8px 14px",
  background: "#f1f5f9",
  color: "#334155",
  borderRadius: 10,
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid #e2e8f0",
};

const statusBadge = (status) => ({
  padding: "6px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.5px",
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