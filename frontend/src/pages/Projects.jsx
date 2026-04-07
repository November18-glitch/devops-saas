import { useState, useEffect } from "react";

export default function Projects() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ TEAMS
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  // ✅ PROJECTS
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  // 🚀 LOAD TEAMS
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/getTeams");
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };

    fetchTeams();
  }, []);

  // 🚀 LOAD PROJECTS (WHEN TEAM CHANGES)
  useEffect(() => {
    if (!selectedTeam) {
      setProjects([]);
      setSelectedProject("");
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/getProjects?teamId=${selectedTeam}`);
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };

    fetchProjects();
  }, [selectedTeam]);

  // 🚀 LOAD DEPLOYMENTS (WHEN TEAM CHANGES)
  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await fetch(
          `/api/getDeployments${selectedTeam ? `?teamId=${selectedTeam}` : ""}`
        );
        const data = await res.json();

        const formatted = (data.deployments || []).map((d) => ({
          id: d.deployment_id,
          status: d.status,
          url: d.url || null,
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
  }, [selectedTeam]);

  // 🚀 DEPLOY
  const handleDeploy = async () => {
    try {
      const selectedProjectData = projects.find(
        (p) => p.id === selectedProject
      );

      if (!selectedProjectData) {
        alert("Please select a project");
        return;
      }

      const res = await fetch("/api/deployProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: selectedProjectData.repo_url,
          projectName: selectedProjectData.name,
          teamId: selectedTeam,
          projectId: selectedProject,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // ✅ optimistic UI update
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

  // 🔄 POLL STATUS
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

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: "40px" }}>
      <h1>🚀 Deploy Dashboard</h1>

      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", marginBottom: "30px" }}>
        <h3>New Deployment</h3>

        {/* ✅ TEAM */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* ✅ PROJECT */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{ marginBottom: "10px", padding: "10px", width: "100%" }}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* ✅ SHOW REPO */}
        {selectedProject && (
          <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "10px" }}>
            Repo: {projects.find((p) => p.id === selectedProject)?.repo_url}
          </p>
        )}

        <button onClick={handleDeploy}>Deploy</button>
      </div>

      <h3>Deployments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p>No deployments yet</p>
      ) : (
        deployments.map((d) => (
          <div key={d.id} style={{ background: "#1e293b", padding: "20px", marginBottom: "20px" }}>
            <p>{d.id}</p>
            <p>Status: {d.status}</p>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank">
                Open
              </a>
            )}

            <div>{d.logs}</div>
          </div>
        ))
      )}
    </div>
  );
}