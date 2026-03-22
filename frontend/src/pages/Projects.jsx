import { useState, useEffect } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [deployments, setDeployments] = useState([]);

  // 🚀 Deploy
  const handleDeploy = async () => {
    const res = await fetch("/api/deployProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl, projectName }),
    });

    const data = await res.json();

    if (res.ok) {
      setDeployments((prev) => [
        {
          id: data.deploymentId,
          status: "BUILDING",
          url: null,
        },
        ...prev,
      ]);
    } else {
      alert(data.error);
    }
  };

  // 🔄 Poll status every 3s
  useEffect(() => {
    const interval = setInterval(async () => {
      setDeployments(async (prev) => {
        const updated = await Promise.all(
          prev.map(async (d) => {
            if (d.status === "READY" || d.status === "ERROR") return d;

            const res = await fetch(
              `/api/deploymentStatus?id=${d.id}`
            );

            const data = await res.json();

            return {
              ...d,
              status: data.status,
              url: data.url || d.url,
            };
          })
        );

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      
      {/* 🚀 DEPLOY FORM */}
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          marginBottom: "40px",
        }}
      >
        <h2>🚀 Deploy Project</h2>

        <input
          placeholder="GitHub Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleDeploy} style={buttonStyle}>
          Deploy
        </button>
      </div>

      {/* 📦 DEPLOYMENTS LIST */}
      <div>
        <h2>📦 Deployments</h2>

        {deployments.map((d) => (
          <div key={d.id} style={cardStyle}>
            <p><strong>ID:</strong> {d.id}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span style={getStatusStyle(d.status)}>
                {d.status}
              </span>
            </p>

            {d.url && (
              <a
                href={`https://${d.url}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0070f3" }}
              >
                🔗 Open Deployment
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STYLES
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  marginTop: "15px",
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  border: "none",
  background: "black",
  color: "white",
  cursor: "pointer",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "15px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
};

const getStatusStyle = (status) => {
  if (status === "READY") return { color: "green" };
  if (status === "ERROR") return { color: "red" };
  return { color: "orange" };
};