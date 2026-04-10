import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 LOAD PROJECT INFO
  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/getProjectById?id=${projectId}`);
      const data = await res.json();
      setProject(data.project);
    };

    fetchProject();
  }, [projectId]);

  // 🚀 LOAD DEPLOYMENTS
  useEffect(() => {
    const fetchDeployments = async () => {
      const res = await fetch(`/api/getDeployments?projectId=${projectId}`);
      const data = await res.json();

      const formatted = data.deployments.map((d) => ({
        id: d.deployment_id,
        status: d.status,
        url: d.url || null,
        logs: d.logs || "",
      }));

      setDeployments(formatted);
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

    if (!res.ok) {
      alert(data.error);
      return;
    }

    // instant UI update
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

  // 🔄 POLL STATUS (LIVE)
  useEffect(() => {
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
    return <p style={{ color: "white", padding: 40 }}>Loading project...</p>;
  }

  return (
    <div style={{ padding: "40px", background: "#0f172a", color: "white", minHeight: "100vh" }}>
      
      {/* 🔥 HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px" }}>📁 {project.name}</h1>

        <p style={{ opacity: 0.7 }}>
          Repo:{" "}
          <a href={project.repo_url} target="_blank" style={{ color: "#38bdf8" }}>
            {project.repo_url}
          </a>
        </p>

        {/* 🌍 PRODUCTION URL */}
        {deployments.find(d => d.status === "READY")?.url && (
          <p style={{ marginTop: "10px" }}>
            🌍 Live:{" "}
            <a
              href={`https://${deployments.find(d => d.status === "READY").url}`}
              target="_blank"
              style={{ color: "#22c55e" }}
            >
              {deployments.find(d => d.status === "READY").url}
            </a>
          </p>
        )}
      </div>

      {/* 🚀 ACTIONS */}
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={handleRedeploy}
          style={{
            background: "#22c55e",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🚀 Redeploy
        </button>
      </div>

      {/* 📦 DEPLOYMENTS */}
      <h2 style={{ marginBottom: "10px" }}>Deployments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p>No deployments yet</p>
      ) : (
        deployments.map((d) => (
          <div
            key={d.id}
            style={{
              background: "#1e293b",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px",
            }}
          >
            <p style={{ fontWeight: "bold" }}>{d.id}</p>

            <p>
              Status:{" "}
              <span
                style={{
                  color:
                    d.status === "READY"
                      ? "#22c55e"
                      : d.status === "ERROR"
                      ? "#ef4444"
                      : "#facc15",
                }}
              >
                {d.status}
              </span>
            </p>

            {/* 🔥 LOGS */}
            <div
              style={{
                background: "#020617",
                padding: "10px",
                marginTop: "10px",
                fontSize: "12px",
                borderRadius: "6px",
                whiteSpace: "pre-wrap",
              }}
            >
              {d.logs}
            </div>

            {/* 🌍 OPEN */}
            {d.url && (
              <a
                href={`https://${d.url}`}
                target="_blank"
                style={{
                  display: "block",
                  marginTop: "10px",
                  color: "#38bdf8",
                }}
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