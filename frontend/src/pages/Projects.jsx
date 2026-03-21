import { useState } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");

  const deployProject = async () => {
    try {
      const res = await fetch("/api/deployProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          projectName,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("RAW RESPONSE:", text);
        alert("Server error");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Deploy failed");
        return;
      }

      console.log("DEPLOYED:", data);

      checkDeploymentStatus(data.deploymentId);

    } catch (err) {
      console.error("DEPLOY ERROR:", err);
    }
  };

  const checkDeploymentStatus = async (id) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/deploymentStatus?deploymentId=${id}`);
      const data = await res.json();

      console.log("STATUS:", data);

      if (data.status === "READY") {
        clearInterval(interval);
        alert("✅ Deployment successful!");
      }

      if (data.status === "ERROR") {
        clearInterval(interval);
        alert("❌ Deployment failed");
      }
    }, 3000);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Deploy Project</h1>

      <input
        type="text"
        placeholder="GitHub Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px" }}
      />

      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px" }}
      />

      <button onClick={deployProject}>
        Deploy 🚀
      </button>
    </div>
  );
}