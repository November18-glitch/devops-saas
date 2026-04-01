import { useState, useEffect } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 LOAD FROM DATABASE (NOW WITH LOGS)
  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await fetch("/api/getDeployments");
        const data = await res.json();

        const formatted = data.deployments.map((d) => ({
          id: d.deployment_id,
          status: d.status,
          url: null,
          logs: d.logs || "",
        }));

        setDeployments(formatted);
      } catch (err) {
        console.error("Failed to load deployments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  // 🚀 Deploy project (UNCHANGED)
  const handleDeploy = async () => {
    try {
      const res = await fetch("/api/deployProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl, projectName }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setDeployments((prev) => [
        {
          id: data.deploymentId,
          status: "BUILDING",
          url: null,
          logs: "🚀 Deployment started...",
        },
        ...prev,
      ]);

    } catch (err) {
      console.error(err);
      alert("Deploy failed");
    }
  };

  // 🔄 Poll status (UNCHANGED LOGIC BUT ALSO REFRESH LOGS)
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
            // logs will refresh on reload (safe approach)
          };
        } catch {
          return { ...d, status: "ERROR" };
        }
      })
    );

    setDeployments(updated);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚀 Deploy Project</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="GitHub Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{ marginRight: "10px", padding: "8px", width: "300px" }}
        />

        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <button onClick={handleDeploy} style={{ padding: "8px 16px" }}>
          Deploy
        </button>
      </div>

      <h3>📦 Deployments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p>No deployments yet</p>
      ) : (
        <div>
          {deployments.map((d) => (
            <div
              key={d.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              <p><strong>ID:</strong> {d.id}</p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      d.status === "READY"
                        ? "green"
                        : d.status === "ERROR"
                        ? "red"
                        : "orange",
                  }}
                >
                  {d.status}
                </span>
              </p>

              {d.url && (
                <a href={`https://${d.url}`} target="_blank">
                  🌍 Open Deployment
                </a>
              )}

              {/* 🔥 LOGS UI */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  background: "#111",
                  color: "#0f0",
                  fontSize: "12px",
                  borderRadius: "6px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {d.logs || "No logs yet..."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}