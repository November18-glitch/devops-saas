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
        <div>
          <div style={loadingTitle}>Synchronizing workspace</div>
          <div style={loadingText}>Loading your LaunchAlly environment...</div>
        </div>
      </div>
    </div>
  );
}

return (
  <div style={container}>
    <div style={main}>

      {/* HERO */}
      <div style={heroCard}>
        <div style={heroGlow}></div>

        <div style={heroContent}>
          <div style={heroTop}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={eyebrow}>
                LAUNCHALLY CONTROL CENTER
              </div>

              <div style={welcomeRow}>
                <h1 style={heroTitle}>
                  Welcome back 👋
                </h1>

                {isPro && (
                  <div style={proBadge}>
                    ✦ PRO
                  </div>
                )}
              </div>

              <p style={heroSubtitle}>
                Deploy systems, orchestrate teams, and monitor
                production changes from one clean workspace.
              </p>

              <div style={teamText}>
                <span style={teamLabel}>
                  ACTIVE WORKSPACES
                </span>

                <b style={teamNames}>
                  {team.map((t) => t.name).join(", ") ||
                    "No Active Workspaces Found"}
                </b>
              </div>
            </div>

            <div style={heroStatus}>
              <div style={statusDot}></div>
              <span>Systems operational</span>
            </div>
          </div>

          {!isPro ? (
            <button
              onClick={handleCheckout}
              onMouseEnter={() => setHoveredBtn("upgrade")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...upgradeBtn,
                transform:
                  hoveredBtn === "upgrade"
                    ? "translateY(-2px)"
                    : "none",
              }}
            >
              <span>🚀</span>
              Upgrade to Pro
              <span style={upgradeArrow}>→</span>
            </button>
          ) : (
            <div style={successBox}>
              <span style={successIcon}>✓</span>
              <div>
                <strong>Pro workspace active</strong>
                <span>
                  Unlimited deployments are unlocked.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK START */}
      {projects.length === 0 && (
        <div style={quickStartBox}>
          <div style={quickStartHeader}>
            <div>
              <div style={sectionEyebrow}>GET STARTED</div>

              <h2 style={quickStartTitle}>
                Your deployment journey starts here
              </h2>

              <p style={quickStartSubtitle}>
                Follow these four steps to get your first
                application running.
              </p>
            </div>

            <div style={rocketIcon}>🚀</div>
          </div>

          <div style={quickStartGrid}>
            <div style={quickStep}>
              <div style={stepNumber}>01</div>
              <div>
                <strong>Create a workspace</strong>
                <span>
                  Organize your projects and collaborators.
                </span>
              </div>
            </div>

            <div style={quickStep}>
              <div style={stepNumber}>02</div>
              <div>
                <strong>Create a project</strong>
                <span>
                  Give your application a home.
                </span>
              </div>
            </div>

            <div style={quickStep}>
              <div style={stepNumber}>03</div>
              <div>
                <strong>Connect GitHub</strong>
                <span>
                  Point LaunchAlly at your repository.
                </span>
              </div>
            </div>

            <div style={quickStep}>
              <div style={stepNumber}>04</div>
              <div>
                <strong>Deploy</strong>
                <span>
                  Analyze, build, and launch your application.
                </span>
              </div>
            </div>
          </div>

          <button
            style={primaryAction}
            onClick={() => navigate("/teams")}
          >
            Create your first team
            <span>→</span>
          </button>
        </div>
      )}

      {/* OVERVIEW */}
      <div style={overviewHeader}>
        <div>
          <div style={sectionEyebrow}>WORKSPACE OVERVIEW</div>
          <h2 style={overviewTitle}>System Overview</h2>
        </div>
      </div>

      <div style={grid}>
        <StatCard
          label="Total Projects"
          value={projects.length}
          emoji="📦"
        />

        <StatCard
          label="Live Deployments"
          value={deployments.length}
          emoji="🚀"
        />

        <StatCard
          label="Verified Members"
          value={membersCount}
          emoji="👥"
        />
      </div>

      {/* DEPLOYMENTS */}
      <div style={tableWrapper}>
        <div style={tableHeader}>
          <div>
            <div style={sectionEyebrow}>
              DEPLOYMENT ACTIVITY
            </div>

            <h3 style={deploymentsTitle}>
              Recent Deployments
            </h3>

            <p style={tableSubtext}>
              Latest operations across your LaunchAlly workspace.
            </p>
          </div>

          <button
            style={viewAllBtn}
            onClick={() => navigate("/projects")}
          >
            View all deployments
            <span>→</span>
          </button>
        </div>

        {deployments.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}>⌁</div>

            <h3 style={emptyTitle}>
              No deployments yet
            </h3>

            <p style={emptyText}>
              Launch your first application to start seeing
              deployment activity and build logs here.
            </p>

            <button
              style={primaryAction}
              onClick={() => navigate("/projects")}
            >
              Provision your first deployment
              <span>→</span>
            </button>
          </div>
        ) : (
          <div style={deploymentsList}>
            {deployments.map((d) => (
              <div
                key={d.deployment_id || d.id}
                style={deploymentCard}
              >
                <div style={deploymentTop}>
                  <div style={deploymentProject}>
                    <div style={projectIcon}>
                      🚀
                    </div>

                    <div>
                      <div style={projectName}>
                        {projects.find(
                          (p) => p.id === d.project_id
                        )?.name || "Production Kernel"}
                      </div>

                      <div style={deployTime}>
                        {d.created_at
                          ? new Date(
                              d.created_at
                            ).toLocaleString()
                          : "Just now"}
                      </div>
                    </div>
                  </div>

                  <span style={statusBadge(d.status)}>
                    <span style={statusIndicator}></span>
                    {d.status || "IDLE"}
                  </span>
                </div>

                <div style={deploymentBottom}>
                  <div style={environmentTag}>
                    <span>●</span>
                    {d.environment || "production"}
                  </div>

                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      style={viewBtn}
                    >
                      Launch instance
                      <span>↗</span>
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

      <div style={statFooter}>
        <span style={statPulse}></span>
        Workspace metric
      </div>
    </div>
  );
}

/* ================= COMPONENT STYLES ================= */

const container = {
  background: "var(--bg)",
  minHeight: "100vh",
  padding: "36px 28px 60px",
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const main = {
  maxWidth: 1180,
  margin: "0 auto",
};

const loadingContainer = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
};

const loadingCard = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: "18px 22px",
  borderRadius: 14,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  color: "var(--text)",
};

const loadingSpinner = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "3px solid #292933",
  borderTopColor: "#8b5cf6",
  animation: "spin 1s linear infinite",
};

const loadingTitle = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 3,
};

const loadingText = {
  fontSize: 12,
  color: "var(--muted)",
};

const heroCard = {
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(145deg, #111116 0%, #0b0b0e 65%, #0e0b19 100%)",
  border: "1px solid #292934",
  borderRadius: 22,
  padding: 30,
  marginBottom: 28,
  boxShadow:
    "0 24px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.025)",
};

const heroGlow = {
  position: "absolute",
  width: 320,
  height: 320,
  right: -120,
  top: -160,
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(124,58,237,0.20), transparent 68%)",
  pointerEvents: "none",
};

const heroContent = {
  position: "relative",
  zIndex: 1,
};

const heroTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  flexWrap: "wrap",
};

const eyebrow = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: 10,
};

const welcomeRow = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

const heroTitle = {
  margin: 0,
  fontSize: 31,
  fontWeight: 800,
  color: "#fafafa",
  letterSpacing: "-0.8px",
};

const heroSubtitle = {
  color: "#a1a1aa",
  lineHeight: 1.65,
  maxWidth: 650,
  fontSize: 14,
  margin: "0 0 20px",
};

const teamText = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const teamLabel = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1px",
  color: "#71717a",
};


const proBadge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 10px",
  borderRadius: 999,
  background:
    "linear-gradient(135deg, #fef08a, #facc15)",
  color: "#713f12",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.7px",
  boxShadow: "0 5px 20px rgba(250,204,21,0.12)",
};

const heroStatus = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "#0b1d13",
  border: "1px solid #164e2a",
  color: "#86efac",
  fontSize: 11,
  fontWeight: 700,
};

const statusDot = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 12px rgba(34,197,94,0.65)",
};

const upgradeBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  marginTop: 28,
  padding: "12px 18px",
  borderRadius: 11,
  border: "1px solid rgba(139,92,246,0.45)",
  background:
    "linear-gradient(135deg, #6366f1, #7c3aed)",
  color: "white",
  fontWeight: 750,
  cursor: "pointer",
  fontSize: 13,
  boxShadow: "0 10px 30px rgba(99,102,241,0.20)",
  transition: "transform .18s ease, box-shadow .18s ease",
};

const upgradeArrow = {
  opacity: 0.7,
  marginLeft: 3,
};

const successBox = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 26,
  padding: "13px 16px",
  width: "fit-content",
  background: "#0b1d13",
  border: "1px solid #14532d",
  borderRadius: 12,
  color: "#86efac",
  fontSize: 13,
};

const successIcon = {
  width: 26,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#14532d",
  color: "#86efac",
  fontWeight: 900,
};

const quickStartBox = {
  background:
    "linear-gradient(145deg, #101014, #0c0c0f)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 28,
  marginBottom: 30,
  boxShadow: "0 16px 50px rgba(0,0,0,0.24)",
};

const quickStartHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "flex-start",
  marginBottom: 26,
};

const sectionEyebrow = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "1.4px",
  marginBottom: 7,
};

const quickStartTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: "-0.3px",
};

const quickStartSubtitle = {
  color: "var(--muted)",
  fontSize: 13,
  margin: "7px 0 0",
};

const rocketIcon = {
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#1a1430",
  border: "1px solid #30205e",
  fontSize: 20,
};

const quickStartGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginBottom: 22,
};

const quickStep = {
  display: "flex",
  gap: 12,
  padding: 15,
  background: "#0a0a0d",
  border: "1px solid var(--border)",
  borderRadius: 12,
};

const stepNumber = {
  color: "#8b5cf6",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11,
  fontWeight: 800,
};

const primaryAction = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 16px",
  borderRadius: 10,
  border: "1px solid rgba(139,92,246,0.4)",
  background:
    "linear-gradient(135deg, #6366f1, #7c3aed)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  boxShadow: "0 8px 25px rgba(99,102,241,0.16)",
};

const overviewHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  marginBottom: 14,
};

const overviewTitle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 800,
  color: "var(--text)",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 14,
  marginBottom: 30,
};

const statCard = {
  background:
    "linear-gradient(145deg, #101014, #0c0c0f)",
  padding: 20,
  borderRadius: 16,
  border: "1px solid var(--border)",
  boxShadow: "0 10px 35px rgba(0,0,0,0.20)",
};

const statTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const statEmoji = {
  width: 38,
  height: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#181820",
  border: "1px solid #292934",
  borderRadius: 10,
  fontSize: 17,
};

const statLabel = {
  color: "#8b8b96",
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const statValue = {
  fontSize: 34,
  fontWeight: 850,
  color: "#fafafa",
  letterSpacing: "-1px",
};

const statFooter = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 10,
  color: "#62626d",
  fontSize: 10,
};

const statPulse = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "#8b5cf6",
  boxShadow: "0 0 8px rgba(139,92,246,0.6)",
};

const tableWrapper = {
  background:
    "linear-gradient(145deg, #101014, #0c0c0f)",
  borderRadius: 20,
  padding: 26,
  border: "1px solid var(--border)",
  boxShadow: "0 16px 50px rgba(0,0,0,0.22)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 22,
};

const deploymentsTitle = {
  margin: 0,
  fontSize: 19,
  fontWeight: 800,
  color: "var(--text)",
};

const tableSubtext = {
  margin: "6px 0 0",
  color: "var(--muted)",
  fontSize: 12,
};

const viewAllBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text-soft)",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};

const deploymentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const deploymentCard = {
  padding: 16,
  background: "#0a0a0d",
  border: "1px solid #27272f",
  borderRadius: 13,
  transition: "border-color .18s ease",
};

const deploymentTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 14,
};

const deploymentProject = {
  display: "flex",
  alignItems: "center",
  gap: 11,
};

const projectIcon = {
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#17141f",
  border: "1px solid #30234c",
  borderRadius: 9,
  fontSize: 15,
};

const projectName = {
  fontWeight: 750,
  fontSize: 14,
  color: "#f5f5f7",
  marginBottom: 3,
};

const deployTime = {
  color: "#686873",
  fontSize: 11,
};

const deploymentBottom = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  paddingTop: 12,
  borderTop: "1px solid #202027",
};

const environmentTag = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  background: "#0b1d22",
  color: "#67e8f9",
  border: "1px solid #164e63",
  padding: "5px 9px",
  borderRadius: 7,
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const emptyState = {
  textAlign: "center",
  padding: "48px 24px",
  border: "1px dashed #30303a",
  borderRadius: 14,
  background: "#09090c",
};

const emptyIcon = {
  width: 48,
  height: 48,
  margin: "0 auto 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  background: "#17141f",
  border: "1px solid #30234c",
  color: "#a78bfa",
  fontSize: 25,
};

const emptyTitle = {
  margin: "0 0 8px",
  color: "var(--text)",
  fontSize: 16,
};

const emptyText = {
  color: "var(--muted)",
  margin: "0 auto 20px",
  fontSize: 13,
  lineHeight: 1.6,
  maxWidth: 430,
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
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 9px",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 10,
    letterSpacing: ".4px",
    background: isReady
      ? "#0b2115"
      : isBuilding
      ? "#211b0b"
      : "#261010",
    color: isReady
      ? "#86efac"
      : isBuilding
      ? "#fcd34d"
      : "#fca5a5",
    border: isReady
      ? "1px solid #14532d"
      : isBuilding
      ? "1px solid #713f12"
      : "1px solid #7f1d1d",
  };
};
const viewBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface-3)",
  color: "var(--text-soft)",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.18s ease",
};

const statusIndicator = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "currentColor",
};

const teamNames = {
  color: "#e4e4e7",
  fontSize: 13,
};