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

  // Track hover states for buttons dynamically without messy external CSS
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    setLoading(true);

    // ========================================
    // GET CURRENT USER SESSION
    // ========================================

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("[DASHBOARD] No session");
      setTeam([]);
      setProjects([]);
      setDeployments([]);
      setMembersCount(0);
      setLoading(false);
      return;
    }

    console.log(
      "[DASHBOARD] USER:",
      session.user.id,
      session.user.email
    );

    // ========================================
    // GET TEAMS THROUGH OUR API
    // ========================================
    // IMPORTANT:
    // We already know this API works because
    // Vercel showed:
    //
    // [GET TEAMS] FINAL TEAMS:
    // [
    //   {
    //     id: "...",
    //     name: "LaunchAlly"
    //   }
    // ]
    //
    // So Dashboard should use that result directly.
    // ========================================

    const teamsResponse = await fetch(
      "/api/app?action=getTeams",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const teamsData = await teamsResponse.json();

    console.log(
      "[DASHBOARD] TEAMS RESPONSE:",
      teamsData
    );

    if (!teamsResponse.ok) {
      console.error(
        "[DASHBOARD] GET TEAMS FAILED:",
        teamsData
      );

      setTeam([]);
      setProjects([]);
      setDeployments([]);
      setMembersCount(0);
      setLoading(false);
      return;
    }

    // These are the actual team objects returned
    // by /api/app?action=getTeams
    const loadedTeams = teamsData.teams || [];

    console.log(
      "[DASHBOARD] LOADED TEAMS:",
      loadedTeams
    );

    setTeam(loadedTeams);

    // ========================================
    // NO TEAMS
    // ========================================

    if (loadedTeams.length === 0) {
      console.log(
        "[DASHBOARD] User has no teams"
      );

      setProjects([]);
      setDeployments([]);
      setMembersCount(0);
      setLoading(false);
      return;
    }

    // ========================================
    // GET TEAM IDS
    // ========================================

    const teamIds = loadedTeams
      .map((t) => t?.id)
      .filter(Boolean);

    console.log(
      "[DASHBOARD] TEAM IDS:",
      teamIds
    );

    if (teamIds.length === 0) {
      setProjects([]);
      setDeployments([]);
      setMembersCount(0);
      setLoading(false);
      return;
    }

    // ========================================
    // LOAD PROJECTS / MEMBERS / DEPLOYMENTS
    // ========================================

    const [
  projectsResult,
  deploymentsResult,
] = await Promise.all([
  supabase
    .from("projects")
    .select("*")
    .in("team_id", teamIds)
    .order("created_at", {
      ascending: false,
    }),

  supabase
    .from("deployments")
    .select("*")
    .in("team_id", teamIds)
    .order("created_at", {
      ascending: false,
    }),
]);

    // ========================================
    // PROJECTS
    // ========================================

    if (projectsResult.error) {
      console.error(
        "[DASHBOARD] PROJECT ERROR:",
        projectsResult.error
      );

      setProjects([]);
    } else {
      setProjects(projectsResult.data || []);
    }

    // ========================================
// VERIFIED MEMBERS
// ========================================

const verifiedMembersTotal =
  loadedTeams.reduce(
    (total, currentTeam) =>
      total + (currentTeam.member_count || 0),
    0
  );

setMembersCount(verifiedMembersTotal);

console.log(
  "[DASHBOARD] VERIFIED MEMBERS:",
  verifiedMembersTotal
);
    // ========================================
    // DEPLOYMENTS
    // ========================================

    if (deploymentsResult.error) {
      console.error(
        "[DASHBOARD] DEPLOYMENTS ERROR:",
        deploymentsResult.error
      );

      setDeployments([]);
    } else {
      setDeployments(
        deploymentsResult.data || []
      );
    }

    console.log(
      "[DASHBOARD] FINAL STATE:",
      {
        teams: loadedTeams,
        projects: projectsResult.data || [],
        members:
          verifiedMembersTotal,
        deployments:
          deploymentsResult.data || [],
      }
    );
  } catch (err) {
    console.error(
      "[DASHBOARD] CORE LOOP FAILURE:",
      err
    );

    setTeam([]);
    setProjects([]);
    setDeployments([]);
    setMembersCount(0);
  } finally {
    setLoading(false);
  }
};

  const handleCheckout = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Please log in first.");
      return;
    }

    const res = await fetch("/api/createCheckoutSession", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error(data);
      alert(data.error || "Stripe error");
    }
  } catch (err) {
    console.error("Billing checkout failed:", err);
  }
};

  if (loading) {
    return (
      <div style={loadingContainer}>
        <div style={loadingCard}>
          <div style={loadingSpinner}></div>
          <div>Synchronizing workspace data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={main}>

        {/* HERO SECTION */}
        <div style={heroCard}>
          <div style={heroTop}>
            <div style={{ flex: 1 }}>
              <div style={welcomeRow}>
                <h1 style={heroTitle}>Welcome back 👋</h1>
                {isPro && <div style={proBadge}>PRO</div>}
              </div>

              <p style={heroSubtitle}>
                Deploy systems, orchestrate teams, and track real-time changes instantly.
              </p>

              <div style={teamText}>
                Active Workspaces:{" "}
                <b style={{ color: "#e4e4e7" }}>
                  {team.map((t) => t.name).join(", ") || "No Active Workspaces Found"}
                </b>
              </div>
            </div>
          </div>

          {!isPro ? (
            <button
              onClick={handleCheckout}
              onMouseEnter={() => setHoveredBtn("upgrade")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...upgradeBtn,
                opacity: hoveredBtn === "upgrade" ? 0.9 : 1,
                transform: hoveredBtn === "upgrade" ? "translateY(-1px)" : "none",
              }}
            >
              🚀 Upgrade to Pro
            </button>
          ) : (
            <div style={successBox}>
              🔥 Platinum access configured: Unlimited deployments unlocked
            </div>
          )}
        </div>

        {/* ONBOARDING QUICK START */}
        {projects.length === 0 && (
          <div style={quickStartBox}>
            <h2 style={quickStartTitle}>🚀 Onboarding Roadmap</h2>
            <ol style={quickStartList}>
              <li style={quickStartStep}>Go to Teams and create a workspace</li>
              <li style={quickStartStep}>Go to Projects and create a project</li>
              <li style={quickStartStep}>Connect your GitHub repository</li>
              <li style={quickStartStep}>Deploy your application</li>
            </ol>
            <button
              style={primaryAction}
              onClick={() => navigate("/teams")}
            >
              Create Team
            </button>
          </div>
        )}

        {/* STATISTICS MATRICES */}
        <div style={grid}>
          <StatCard label="Total Projects" value={projects.length} emoji="📦" />
          <StatCard label="Live Deployments" value={deployments.length} emoji="🚀" />
          <StatCard label="Verified Members" value={membersCount} emoji="👥" />
        </div>

        {/* LIVE DEPLOYMENT RECORDS */}
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <div>
              <h3 style={deploymentsTitle}>Recent Logs & Deployments</h3>
              <p style={tableSubtext}>Latest operations pipeline metrics across your groups</p>
            </div>
            <button style={viewAllBtn} onClick={() => navigate("/projects")}>
              View System Logs
            </button>
          </div>

          {deployments.length === 0 ? (
            <div style={emptyState}>
              <div style={emptyEmoji}>📡</div>
              <h3 style={{ marginBottom: 10, color: "#f5f5f5" }}>No execution contexts found</h3>
              <p style={emptyText}>
                Launch an app deployment stream inside a workspace project to build logs.
              </p>
              <button style={primaryAction} onClick={() => navigate("/projects")}>
                Provision Stack
              </button>
            </div>
          ) : (
            <div style={deploymentsList}>
              {deployments.map((d) => (
                <div key={d.deployment_id || d.id} style={deploymentCard}>
                  <div style={deploymentTop}>
                    <div>
                      <div style={projectName}>
                        {projects.find((p) => p.id === d.project_id)?.name || "Production Kernel"}
                      </div>
                      <div style={deployTime}>
                        {d.created_at ? new Date(d.created_at).toLocaleString() : "Just now"}
                      </div>
                    </div>
                    <span style={statusBadge(d.status)}>
                      {d.status || "IDLE"}
                    </span>
                  </div>

                  <div style={deploymentBottom}>
                    <div style={environmentTag}>{d.environment || "production"}</div>
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        style={viewBtn}
                      >
                        Launch Instance ↗
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
        <div style={statLabel}>{label}</div>
        <div style={statEmoji}>{emoji}</div>
      </div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

/* ================= COMPONENT SPECIFIC INTERFACE STYLES ================= */
const container = {
  background: "#050505",
  minHeight: "100vh",
  padding: "40px 24px",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

const main = {
  maxWidth: 1140,
  margin: "0 auto",
};

const loadingContainer = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#050505",
};

const loadingCard = {
  background: "#0d0d0d",
  padding: "24px 36px",
  borderRadius: 16,
  border: "1px solid #262626",
  boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  color: "#a1a1aa",
  fontWeight: 600,
};

const loadingSpinner = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "3px solid #e2e8f0",
  borderTop: "3px solid #6366f1",
  animation: "spin 1s linear infinite",
};

const heroCard = {
  background: "#0d0d0d",
  borderRadius: 24,
  padding: 32,
  marginBottom: 24,
  border: "1px solid #262626",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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
  marginBottom: 12,
};

const heroTitle = {
  fontSize: 30,
  margin: 0,
  fontWeight: 800,
  color: "#f5f5f5",
  letterSpacing: "-0.5px",
};

const heroSubtitle = {
  color: "#a1a1aa",
  lineHeight: 1.6,
  maxWidth: 640,
  fontSize: 15,
  margin: "0 0 16px 0",
};

const teamText = {
  color: "#71717a",
  fontSize: 14,
};

const proBadge = {
  background: "linear-gradient(135deg, #fef08a, #facc15)",
  color: "#713f12",
  padding: "4px 10px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.5px",
};

const upgradeBtn = {
  marginTop: 24,
  padding: "12px 24px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
  boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.3)",
  transition: "all 0.2s ease-in-out",
};

const successBox = {
  marginTop: 24,
  padding: "14px 18px",
  background: "#0c2415",
  border: "1px solid #14532d",
  color: "#4ade80",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 14,
};

const quickStartBox = {
  background: "#0d0d0d",
  border: "1px solid #262626",
  borderRadius: 20,
  padding: 32,
  marginBottom: 24,
};

const quickStartTitle = {
  margin: "0 0 16px 0",
  fontSize: 20,
  fontWeight: 700,
  color: "#f5f5f5",
};

const quickStartList = {
  margin: "0 0 24px 0",
  paddingLeft: 20,
  lineHeight: "2.2",
  color: "#a1a1aa",
  fontSize: 14,
};

const quickStartStep = {
  fontWeight: 500,
};

const primaryAction = {
  padding: "12px 22px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "background 0.2s",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
  marginBottom: 24,
};

const statCard = {
  background: "#0d0d0d",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #262626",
  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
};

const statTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const statEmoji = {
  fontSize: 18,
  background: "#18181b",
  padding: "6px 10px",
  borderRadius: 8,
};

const statLabel = {
  color: "#a1a1aa",
  fontSize: 13,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const statValue = {
  fontSize: 32,
  fontWeight: 800,
  color: "#f5f5f5",
  letterSpacing: "-0.5px",
};

const tableWrapper = {
  background: "#0d0d0d",
  borderRadius: 20,
  padding: 32,
  border: "1px solid #262626",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 24,
};

const deploymentsTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#f5f5f5",
  marginBottom: 4,
};

const tableSubtext = {
  margin: 0,
  color: "#71717a",
  fontSize: 13,
};

const viewAllBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #303030",
  background: "#111111",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  color: "#d4d4d8",
  transition: "all 0.15s",
};

const deploymentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const deploymentCard = {
  border: "1px solid #27272a",
  borderRadius: 12,
  padding: 16,
  background: "#111111",
};

const deploymentTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 12,
  flexWrap: "wrap",
};

const projectName = {
  fontWeight: 700,
  fontSize: 15,
  color: "#f5f5f5",
  marginBottom: 2,
};

const deployTime = {
  color: "#71717a",
  fontSize: 12,
};

const deploymentBottom = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const environmentTag = {
  background: "#0c1f2a",
  color: "#38bdf8",
  border: "1px solid #075985",
  padding: "4px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
};

const emptyState = {
  textAlign: "center",
  padding: "48px 24px",
};

const emptyEmoji = {
  fontSize: 36,
  marginBottom: 14,
};

const emptyText = {
  color: "#64748b",
  marginBottom: 20,
  fontSize: 14,
  maxWidth: 400,
  margin: "0 auto 20px auto",
};

const viewBtn = {
  padding: "6px 12px",
  background: "#18181b",
  color: "#e4e4e7",
  borderRadius: 8,
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid #303030",
  boxShadow: "none",
};

const statusBadge = (status) => {
  const normStatus = (status || "").toUpperCase();

  const isReady =
    normStatus === "READY" ||
    normStatus === "SUCCESS" ||
    normStatus === "ACTIVE";

  const isBuilding =
    normStatus === "BUILDING" ||
    normStatus === "PENDING";

  return {
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.5px",
    background: isReady
      ? "#0c2415"
      : isBuilding
      ? "#2a2110"
      : "#2a1111",
    color: isReady
      ? "#4ade80"
      : isBuilding
      ? "#facc15"
      : "#f87171",
    border: isReady
      ? "1px solid #14532d"
      : isBuilding
      ? "1px solid #713f12"
      : "1px solid #451a1a",
  };
};