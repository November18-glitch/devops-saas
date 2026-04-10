import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 LOAD DEPLOYMENTS FOR THIS PROJECT
  useEffect(() => {
    if (!projectId) return;

    const fetchDeployments = async () => {
      try {
        const res = await fetch(`/api/getDeployments?projectId=${projectId}`);
        const data = await res.json();

        const formatted = (data.deployments || []).map((d) => ({
          id: d.deployment_id,
          status: d.status,
          url: d.url || null,
          logs: d.logs || "",
        }));

        setDeployments(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load deployments", err);
      }
    };

    fetchDeployments();
  }, [projectId]);

  // 🔄 POLL STATUS + LOGS (same as Projects.jsx)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatuses(deployments);
    }, 3000);

    return () => clearInterval(interval);
  }, [deployments]);

  const fetchStatuses = async (deploymentsList) => {
    const updated = await Promise.all(
      deploymentsList.map(async (d) => {
        if (d.status === "READY" || d.status === "ERROR") return d;

        try {
          const res = await fetch(`/api/deploymentStatus?id=${d.id}`);
          const data = await res.json();

          return {
            ...d,
            status: data.status,
            url: data.url || d.url,
            logs: data.logs || d.logs,
          };
        } catch {
          return { ...d, status: "ERROR" };
        }
      })
    );

    setDeployments(updated);
  };

  return (
    <div style={{ padding: "40px", background: "#0f172a", color: "white", minHeight: "100vh" }}>
      <h1>📂 Project</h1>
      <h2>Project Name</h2>
       <p>Repo URL</p>
       <button>Redeploy</button>
      <p style={{ opacity: 0.7, marginBottom: "20px" }}>
        Project ID: {projectId}
      </p>

      <h3>Deployments</h3>

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

            {/* 🌍 OPEN DEPLOYMENT */}
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