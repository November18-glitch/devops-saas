import { useState, useEffect } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 LOAD FROM DATABASE
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

  // 🚀 Deploy project
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

  // 🔄 Poll status
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
          };
        } catch {
          return { ...d, status: "ERROR" };
        }
      })
    );

    setDeployments(updated);
  };

  // 🎨 PREMIUM UI
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        🚀 Deploy Dashboard
      </h1>

      {/* INPUT SECTION */}
      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>New Deployment</h3>

        <input
          placeholder="GitHub Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#0f172a",
            color: "white",
          }}
        />

        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            background: "#0f172a",
            color: "white",
          }}
        />

        <button
          onClick={handleDeploy}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            cursor: "pointer",
          }}
        >
          Deploy
        </button>
      </div>

      {/* DEPLOYMENTS */}
      <h3 style={{ marginBottom: "15px" }}>Deployments</h3>

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
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              {d.id}
            </p>

            <p style={{ marginTop: "5px" }}>
              Status:{" "}
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background:
                    d.status === "READY"
                      ? "#16a34a"
                      : d.status === "ERROR"
                      ? "#dc2626"
                      : "#f59e0b",
                }}
              >
                {d.status}
              </span>
            </p>

            {d.url && (
              <a
                href={`https://${d.url}`}
                target="_blank"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  color: "#3b82f6",
                }}
              >
                🌍 Open Deployment
              </a>
            )}

            {/* LOGS */}
            <div
              style={{
                marginTop: "15px",
                background: "#020617",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                color: "#22c55e",
              }}
            >
              {d.logs || "No logs yet..."}
            </div>
          </div>
        ))
      )}
    </div>
  );
}