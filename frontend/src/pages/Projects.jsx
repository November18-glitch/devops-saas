import { useState, useEffect } from "react";

export default function Projects() {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [deployments, setDeployments] = useState([]);

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
        },
        ...prev,
      ]);

    } catch (err) {
      console.error(err);
      alert("Deploy failed");
    }
  };

  // 🔄 Poll deployment status
    useEffect(() => {
  // ✅ LOAD FROM DATABASE ON START
  const loadDeployments = async () => {
    try {
      const res = await fetch("/api/getDeployments");
      const data = await res.json();

      const formatted = data.deployments.map((d) => ({
        id: d.deployment_id,
        status: d.status,
        url: null,
      }));

      setDeployments(formatted);
    } catch (err) {
      console.error("Failed to load deployments");
    }
  };

  loadDeployments();

  // 🔄 KEEP YOUR POLLING (UNCHANGED)
  const interval = setInterval(() => {
    setDeployments((prev) => {
      fetchStatuses(prev);
      return prev;
    });
  }, 3000);

  return () => clearInterval(interval);
}, []);

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

  return (
    <div>
      <h2>Deploy Project</h2>

      <input
        placeholder="Repo URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      />

      <input
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <button onClick={handleDeploy}>Deploy</button>

      <h3>Deployments</h3>

      {deployments.map((d) => (
        <div key={d.id}>
          <p>ID: {d.id}</p>
          <p>Status: {d.status}</p>

          {d.url && (
            <a href={`https://${d.url}`} target="_blank">
              Open
            </a>
          )}
        </div>
      ))}
    </div>
  );
}