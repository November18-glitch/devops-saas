import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 LOAD PROJECT
  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/getProjectById?id=${projectId}`);
      const data = await res.json();
      setProject(data.project || null);
    };

    fetchProject();
  }, [projectId]);

  // 🚀 LOAD DEPLOYMENTS
  useEffect(() => {
    const fetchDeployments = async () => {
      const res = await fetch(`/api/getDeployments?projectId=${projectId}`);
      const data = await res.json();

      const safe = data.deployments || []; // ✅ FIX

      setDeployments(
        safe.map((d) => ({
          id: d.deployment_id,
          status: d.status,
          url: d.url || null,
          logs: d.logs || "",
        }))
      );

      setLoading(false);
    };

    fetchDeployments();
  }, [projectId]);

  // 🚀 REDEPLOY
  const handleRedeploy = async () => {
    if (!project) return;

    const res = await fetch("/api/deployProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoUrl: project.repo_url,
        projectName: project.name,
        teamId: project.team_id,
        projectId: projectId,
      }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    setDeployments((prev) => [
      {
        id: data.deploymentId,
        status: "BUILDING",
        url: null,
        logs: "🚀 Deployment started...",
      },
      ...prev,
    ]);
  };

  // 🔄 POLLING
  useEffect(() => {
    if (!deployments.length) return;

    const interval = setInterval(() => {
      fetchStatuses(deployments);
    }, 3000);

    return () => clearInterval(interval);
  }, [deployments]);

  const fetchStatuses = async (list) => {
    const updated = await Promise.all(
      list.map(async (d) => {
        if (d.status === "READY" || d.status === "ERROR") return d;

        const res = await fetch(`/api/deploymentStatus?id=${d.id}`);
        const data = await res.json();

        return {
          ...d,
          status: data.status,
          url: data.url || d.url,
          logs: data.logs || d.logs,
        };
      })
    );

    setDeployments(updated);
  };

  if (!project) {
    return (
      <div style={container}>
        <p>Loading project...</p>
      </div>
    );
  }

  const liveDeployment = deployments.find((d) => d.status === "READY");

  return (
    <div style={container}>
      
      {/* HEADER */}
      <div style={header}>
        <h1 style={{ fontSize: 28 }}>📁 {project.name}</h1>

        <p style={{ color: "#64748b" }}>
          Repo:{" "}
          <a href={project.repo_url} target="_blank" style={link}>
            {project.repo_url}
          </a>
        </p>

        {liveDeployment?.url && (
          <p style={{ marginTop: 10 }}>
            🌍 Live:{" "}
            <a
              href={`https://${liveDeployment.url}`}
              target="_blank"
              style={{ color: "#22c55e", fontWeight: "bold" }}
            >
              {liveDeployment.url}
            </a>
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div style={{ marginBottom: 30 }}>
        <button style={primaryBtn} onClick={handleRedeploy}>
          🚀 Redeploy
        </button>
      </div>

      {/* DEPLOYMENTS */}
      <h2>Deployments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p style={{ color: "#64748b" }}>No deployments yet</p>
      ) : (
        deployments.map((d) => (
          <div key={d.id} style={card}>
            <p style={{ fontWeight: "bold" }}>{d.id}</p>

            <p>
              Status:{" "}
              <span style={{
                fontWeight: "bold",
                color:
                  d.status === "READY"
                    ? "#22c55e"
                    : d.status === "ERROR"
                    ? "#ef4444"
                    : "#facc15",
              }}>
                {d.status}
              </span>
            </p>

            <div style={logs}>{d.logs}</div>

            {d.url && (
              <a
                href={`https://${d.url}`}
                target="_blank"
                style={link}
              >
                🌍 Open Deployment
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* 🎨 UI */

const container = {
  padding: 40,
  background: "#f1f5f9",
  minHeight: "100vh",
  color: "#0f172a",
};

const header = {
  marginBottom: 30,
};

const card = {
  background: "white",
  padding: 16,
  marginTop: 12,
  borderRadius: 12,
  boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
};

const logs = {
  background: "#f8fafc",
  padding: 10,
  marginTop: 10,
  fontSize: 12,
  borderRadius: 6,
  whiteSpace: "pre-wrap",
  maxHeight: 150,
  overflow: "auto",
};

const primaryBtn = {
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const link = {
  color: "#6366f1",
  textDecoration: "none",
};