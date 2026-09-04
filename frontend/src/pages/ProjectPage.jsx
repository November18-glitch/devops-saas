import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {

  const { projectId } =
    useParams();

  const [project, setProject] =
    useState(null);

  const [deployments, setDeployments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [redeploying, setRedeploying] =
    useState(false);

  /*
  ==========================
  SAFE JSON
  ==========================
  */

  async function safeJson(res) {

    const text =
      await res.text();

    try {
      return JSON.parse(text);
    }

    catch {

      console.error(
        "[INVALID JSON]",
        text
      );

      throw new Error(
        "Server returned invalid response"
      );
    }
  }

  /*
  ==========================
  LOAD PROJECT
  ==========================
  */

  useEffect(() => {

    const fetchProject =
      async () => {

        try {

          const res =
            await fetch(`/api/app?action=getProjectById&id=${projectId}`);

          const data =
            await safeJson(res);

          setProject(
            data.project || null
          );

        } catch (err) {

          console.error(
            err
          );
        }
      };

    fetchProject();

  }, [projectId]);

  /*
  ==========================
  LOAD DEPLOYMENTS
  ==========================
  */

  useEffect(() => {

    const fetchDeployments =
      async () => {

        try {

          const res =
            await fetch(
              `/api/app?action=getDeployments&projectId=${projectId}`
            );

          const data =
            await safeJson(res);

          const safe =
            (data.deployments || [])
            .sort(
            (a,b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
            );

          setDeployments(
            safe.map((d) => ({
             id: d.deployment_id,
             status: d.status,
             url: d.url || null,
             logs: d.logs || "",
             createdAt: d.created_at,
           }))
          );

        } catch (err) {

          console.error(
            err
          );

        } finally {

          setLoading(false);
        }
      };

    fetchDeployments();

  }, [projectId]);

  /*
  ==========================
  REDEPLOY
  ==========================
  */

  const handleRedeploy =
    async () => {

      if (!project) return;
      setRedeploying(true);
      try {

        const res =
          await fetch(
            "/api/deployProject",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({

                  repoUrl:
                    project.repo_url,

                  projectName:
                    project.name,

                  teamId:
                    project.team_id,

                  projectId,

                  userId:
                    project.user_id,
                }),
                
            }
            
          );

        const data =
          await safeJson(res);

        if (!res.ok) {
          return alert(
            data.error
          );
        }

        setDeployments(
          (prev) => [
            {
           id: data.localDeploymentId,
           status: "BUILDING",
           url: data.url || null,
           logs: "🚀 Deployment started...",
           createdAt: new Date().toISOString(),
         },

            ...prev,
          ]
        );

      } catch (err) {

       console.error(err);

       alert(err.message);

      } finally {

       setRedeploying(false);

      }
    };

  /*
  ==========================
  POLLING
  ==========================
  */

  useEffect(() => {

  if (!deployments.length) return;

  fetchStatuses(deployments);

  const interval = setInterval(() => {
    fetchStatuses(deployments);
  }, 5000);

  return () => clearInterval(interval);

}, [deployments]);

  const fetchStatuses =
    async (list) => {

      const updated =
        await Promise.all(

          list.map(
            async (d) => {

              if (
                d.status === "READY" ||
                d.status === "ERROR"
              ) {
                return d;
              }

              try {

                const res =
                  await fetch(
                    `/api/deploymentStatus?id=${d.id}`
                  );

                const data =
                  await safeJson(res);

                return {
                  ...d,

                  status:
                    data.status,

                  url:
                    data.url || d.url,

                  logs:
                    data.logs || d.logs,
                };

              } catch {

                return d;
              }
            }
          )
        );

      setDeployments(
        updated
      );
    };

  /*
  ==========================
  LOADING
  ==========================
  */

  if (!project) {
    return (
      <div style={container}>
        <p>
          Loading project...
        </p>
      </div>
    );
  }

  const liveDeployment =
    deployments.find(
      (d) =>
        d.status === "READY"
    );

  /*
  ==========================
  UI
  ==========================
  */

  return (
  <div style={container}>
    <div style={content}>

      {/* HEADER */}
      <div style={header}>
        <div style={eyebrow}>
          PROJECT CONTROL
        </div>

        <div style={titleRow}>
          <div>
            <h1 style={title}>
              📁 {project.name}
            </h1>

            <p style={repoText}>
              Repository{" "}
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                style={link}
              >
                {project.repo_url}
              </a>
            </p>
          </div>

          <div style={projectStatus}>
            <span style={statusDot}></span>
            Project active
          </div>
        </div>

        {project.deployable === false && (
          <div style={errorBanner}>
            <div style={errorIcon}>!</div>

            <div>
              <strong>
                Deployment unavailable
              </strong>

              <p>
                {project.analysis_reason}
              </p>
            </div>
          </div>
        )}

        {liveDeployment?.url && (
          <div style={liveBanner}>
            <div style={liveLeft}>
              <span style={liveDot}></span>

              <div>
                <span style={liveLabel}>
                  PRODUCTION DEPLOYMENT
                </span>

                <a
                  href={liveDeployment.url}
                  target="_blank"
                  rel="noreferrer"
                  style={liveUrl}
                >
                  {liveDeployment.url}
                </a>
              </div>
            </div>

            <a
              href={liveDeployment.url}
              target="_blank"
              rel="noreferrer"
              style={openLiveButton}
            >
              Open live app ↗
            </a>
          </div>
        )}
      </div>

      {/* ACTION */}
      <div style={actionBar}>
        <div>
          <div style={sectionEyebrow}>
            DEPLOYMENT CONTROL
          </div>

          <strong style={actionTitle}>
            Ready to ship another version?
          </strong>
        </div>

        <button
          style={primaryBtn}
          onClick={handleRedeploy}
          disabled={
            redeploying ||
            project.deployable === false
          }
        >
          {redeploying
            ? "Deploying..."
            : "🚀 Redeploy"}
        </button>
      </div>

      {/* DEPLOYMENTS */}
      <div style={sectionHeader}>
        <div>
          <div style={sectionEyebrow}>
            HISTORY
          </div>

          <h2 style={sectionTitle}>
            Deployments
          </h2>

          <p style={sectionSubtitle}>
            Inspect build status and deployment output.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={emptyState}>
          <div style={loader}></div>
          <p>Loading deployment history...</p>
        </div>
      ) : deployments.length === 0 ? (
        <div style={emptyState}>
          <div style={emptyIcon}>
            🚀
          </div>

          <h3>
            No deployments yet
          </h3>

          <p>
            Your first deployment will appear here.
          </p>
        </div>
      ) : (
        deployments.map((d) => (
          <div
            key={d.id}
            style={card}
          >
            <div style={deploymentHeader}>
              <div>
                <div style={deploymentId}>
                  {d.id}
                </div>

                <div style={deploymentDate}>
                  {new Date(
                    d.createdAt
                  ).toLocaleString()}
                </div>
              </div>

              <div
                style={deploymentStatus(d.status)}
              >
                <span></span>

                {d.status === "ANALYZING" &&
                  "Analyzing"}

                {d.status === "BUILDING" &&
                  "Building"}

                {d.status === "READY" &&
                  "Ready"}

                {d.status === "ERROR" &&
                  "Failed"}

                {![
                  "ANALYZING",
                  "BUILDING",
                  "READY",
                  "ERROR",
                ].includes(d.status) &&
                  d.status}
              </div>
            </div>

            {/* LOGS */}
            <div style={logsSection}>
              <div style={logsHeader}>
                <div>
                  <span style={terminalDot}></span>
                  BUILD OUTPUT
                </div>

                <span style={logsHint}>
                  Deployment diagnostics
                </span>
              </div>

              <div style={logs}>
                {d.logs ||
                  "No deployment logs available."}
              </div>
            </div>

            {/* FOOTER */}
            {d.url && (
              <div style={deploymentFooter}>
                <div style={liveIndicator}>
                  <span></span>
                  Deployment available
                </div>

                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  style={liveLink}
                >
                  Open Deployment ↗
                </a>
              </div>
            )}
          </div>
        ))
      )}

    </div>
  </div>
);
}

/* =========================
   UI
========================= */

const container = {
  background: "var(--bg)",
  minHeight: "100vh",
  padding: "34px 28px 60px",
  color: "var(--text)",
};

const content = {
  maxWidth: 1050,
  margin: "0 auto",
};

const eyebrow = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 850,
  letterSpacing: "1.5px",
  marginBottom: 8,
};

const header = {
  marginBottom: 24,
};

const titleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const title = {
  margin: 0,
  fontSize: 30,
  fontWeight: 850,
  letterSpacing: "-.8px",
  color: "var(--text)",
};

const repoText = {
  margin: "7px 0 0",
  color: "var(--muted)",
  fontSize: 12,
};

const link = {
  color: "#a78bfa",
  textDecoration: "none",
};

const projectStatus = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "7px 10px",
  borderRadius: 999,
  background: "#0b1d13",
  border: "1px solid #164e2a",
  color: "#86efac",
  fontSize: 10,
  fontWeight: 800,
};

const statusDot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 9px rgba(34,197,94,.6)",
};

const errorBanner = {
  display: "flex",
  alignItems: "flex-start",
  gap: 13,
  marginTop: 18,
  padding: 16,
  background:
    "linear-gradient(145deg, #211010, #160b0b)",
  border: "1px solid #7f1d1d",
  borderRadius: 13,
  color: "#fca5a5",
};

const errorIcon = {
  width: 28,
  height: 28,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#451a1a",
  color: "#f87171",
  fontWeight: 900,
};

const liveBanner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
  marginTop: 16,
  padding: 15,
  background:
    "linear-gradient(145deg, #0b1d13, #08140e)",
  border: "1px solid #14532d",
  borderRadius: 13,
};

const liveLeft = {
  display: "flex",
  alignItems: "center",
  gap: 11,
};

const liveDot = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 12px rgba(34,197,94,.65)",
};

const liveLabel = {
  display: "block",
  color: "#86efac",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1px",
  marginBottom: 3,
};

const liveUrl = {
  color: "#bbf7d0",
  textDecoration: "none",
  fontSize: 12,
};

const openLiveButton = {
  padding: "9px 12px",
  borderRadius: 9,
  background: "#12351f",
  border: "1px solid #166534",
  color: "#86efac",
  textDecoration: "none",
  fontWeight: 750,
  fontSize: 11,
};

const actionBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  padding: 19,
  marginBottom: 32,
  background:
    "linear-gradient(145deg, #101014, #0c0c0f)",
  border: "1px solid var(--border)",
  borderRadius: 15,
};

const sectionEyebrow = {
  color: "#8b5cf6",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1.3px",
  marginBottom: 5,
};

const actionTitle = {
  color: "var(--text)",
  fontSize: 13,
};

const primaryBtn = {
  padding: "11px 16px",
  borderRadius: 10,
  border: "1px solid rgba(139,92,246,.4)",
  background:
    "linear-gradient(135deg,#6366f1,#7c3aed)",
  color: "white",
  fontWeight: 750,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(99,102,241,.18)",
};

const sectionHeader = {
  marginBottom: 15,
};

const sectionTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 21,
  fontWeight: 850,
};

const sectionSubtitle = {
  margin: "5px 0 0",
  color: "var(--muted)",
  fontSize: 12,
};

const card = {
  background:
    "linear-gradient(145deg,#101014,#0c0c0f)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 18,
  marginBottom: 12,
  boxShadow: "0 10px 35px rgba(0,0,0,.20)",
};

const deploymentHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
  marginBottom: 16,
};

const deploymentId = {
  color: "var(--text)",
  fontWeight: 750,
  fontFamily: "ui-monospace, monospace",
  fontSize: 13,
};

const deploymentDate = {
  color: "#62626d",
  fontSize: 10,
  marginTop: 5,
};

const deploymentStatus = (value) => {
  const normalized = (value || "").toUpperCase();

  const ready =
    normalized === "READY";

  const building =
    normalized === "BUILDING" ||
    normalized === "ANALYZING";

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 850,
    background: ready
      ? "#0b2115"
      : building
      ? "#211b0b"
      : "#261010",
    color: ready
      ? "#86efac"
      : building
      ? "#fcd34d"
      : "#fca5a5",
    border: ready
      ? "1px solid #14532d"
      : building
      ? "1px solid #713f12"
      : "1px solid #7f1d1d",
  };
};

const logsSection = {
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #202027",
};

const logsHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 11px",
  background: "#101014",
  color: "#73737e",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: ".8px",
};

const terminalDot = {
  display: "inline-block",
  width: 6,
  height: 6,
  marginRight: 6,
  borderRadius: "50%",
  background: "#8b5cf6",
};

const logsHint = {
  color: "#4f4f59",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: 0,
};

const logs = {
  background: "#07070a",
  color: "#b8b8c2",
  padding: 14,
  fontSize: 11,
  whiteSpace: "pre-wrap",
  maxHeight: 210,
  overflow: "auto",
  lineHeight: 1.65,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const deploymentFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 13,
};

const liveIndicator = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#86efac",
  fontSize: 10,
  fontWeight: 700,
};

const liveLink = {
  padding: "9px 12px",
  background: "#17141f",
  border: "1px solid #30234c",
  color: "#c4b5fd",
  borderRadius: 9,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 11,
};

const emptyState = {
  textAlign: "center",
  padding: "45px 20px",
  background: "#0b0b0f",
  border: "1px dashed #30303a",
  borderRadius: 15,
  color: "var(--muted)",
};

const emptyIcon = {
  fontSize: 28,
  marginBottom: 8,
};

const loader = {
  width: 21,
  height: 21,
  margin: "0 auto 12px",
  borderRadius: "50%",
  border: "3px solid #292933",
  borderTopColor: "#8b5cf6",
  animation: "spin 1s linear infinite",
};