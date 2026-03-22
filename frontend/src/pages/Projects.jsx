import { useState } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeploy = async () => {
    setLoading(true);
    setStatus("Deploying...");

    try {
      const res = await fetch("/api/deployProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          repoUrl,
          projectName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deploy failed");
      }

      setStatus("✅ Deployment started!");
      console.log("Deployment:", data);

    } catch (err) {
      console.error(err);
      setStatus("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚀 Deploy Project</h2>

        <input
          style={styles.input}
          placeholder="GitHub Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleDeploy}
          disabled={loading}
        >
          {loading ? "Deploying..." : "Deploy"}
        </button>

        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f6fa"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  title: {
    textAlign: "center"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer"
  },
  status: {
    marginTop: "10px",
    textAlign: "center"
  }
};