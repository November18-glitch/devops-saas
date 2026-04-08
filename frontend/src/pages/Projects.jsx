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

  // ✅ CREATE PROJECT INPUTS
  const [newProjectName, setNewProjectName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");

  // 🚀 LOAD TEAMS
  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch("/api/getTeams");
      const data = await res.json();
      setTeams(data.teams || []);
    };
    fetchTeams();
  }, []);

  // 🚀 LOAD PROJECTS WHEN TEAM CHANGES
  useEffect(() => {
    if (!selectedTeam) {
      setProjects([]);
      setSelectedProject("");
      return;
    }

    const fetchProjects = async () => {
      const res = await fetch(`/api/getProjects?teamId=${selectedTeam}`);
      const data = await res.json();
      setProjects(data.projects || []);
    };

    fetchProjects();

    // 🔥 reset selected project when team changes
    setSelectedProject("");
  }, [selectedTeam]);

  // 🚀 LOAD DEPLOYMENTS (🔥 THIS WAS MISSING)
  useEffect(() => {
    setLoading(true);
    const fetchDeployments = async () => {
      try {
        const res = await fetch(
          selectedProject
           ? `/api/getDeployments?projectId=${selectedProject}`
           : `/api/getDeployments${selectedTeam ? `?teamId=${selectedTeam}` : ""}`
        );
        const data = await res.json();

        const formatted = data.deployments.map((d) => ({
          id: d.deployment_id,
          status: d.status,
          url: null,
          logs: d.logs || "",
        }));

        setDeployments(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load deployments", err);
      }
    };

    fetchDeployments();
  }, [selectedTeam]);

  // 🚀 CREATE PROJECT
  const handleCreateProject = async () => {
    if (!newProjectName || !newRepoUrl || !selectedTeam) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/createProject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectName,
          repoUrl: newRepoUrl,
          teamId: selectedTeam,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // ✅ instant UI update
      setProjects((prev) => [data.project, ...prev]);

      setNewProjectName("");
      setNewRepoUrl("");

      alert("✅ Project created!");
    } catch (err) {
      console.error(err);
      alert("Create project failed");
    }
  };

  // 🚀 DEPLOY
  const handleDeploy = async () => {
    const selectedProjectData = projects.find(
      (p) => p.id === selectedProject
    );

    if (!selectedProjectData) {
      alert("Select a project");
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

    // ✅ add instantly
    setDeployments((prev) => [
      {
        id: data.deploymentId,
        status: "BUILDING",
        url: null,
        logs: "🚀 Deployment started...",
      },
      ...prev,
    ]);

    // 🔥 ALSO REFETCH (important)
    const resReload = await fetch(
     `/api/getDeployments?projectId=${selectedProject}`
    );
    const dataReload = await resReload.json();

    setDeployments(
      dataReload.deployments.map((d) => ({
        id: d.deployment_id,
        status: d.status,
        url: null,
        logs: d.logs || "",
      }))
    );
  };

  // 🔄 POLL STATUS (UNCHANGED)
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

        const res = await fetch(`/api/deploymentStatus?id=${d.id}`);
        const data = await res.json();

        return {
          ...d,
          status: data.status,
          url: data.url || d.url,
        };
      })
    );

    setDeployments(updated);
  };

  return (
    <div style={{ padding: "40px", background: "#0f172a", color: "white" }}>
      <h1>🚀 Deploy Dashboard</h1>

      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px" }}>
        <h3>Create Project</h3>

        {/* TEAM */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          placeholder="GitHub Repo URL"
          value={newRepoUrl}
          onChange={(e) => setNewRepoUrl(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <button onClick={handleCreateProject}>➕ Create Project</button>

        <hr style={{ margin: "20px 0" }} />

        <h3>Deploy</h3>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {selectedProject && (
          <p style={{ fontSize: "12px", opacity: 0.7 }}>
            Repo: {projects.find(p => p.id === selectedProject)?.repo_url}
          </p>
        )}

        <button onClick={handleDeploy}>🚀 Deploy</button>
      </div>

      <h3 style={{ marginTop: "30px" }}>Deployments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        deployments.map((d) => (
          <div key={d.id} style={{ background: "#1e293b", padding: "15px", marginTop: "10px" }}>
            <p>{d.id}</p>
            <p>Status: {d.status}</p>
            <div>{d.logs}</div>
          </div>
        ))
      )}
    </div>
  );
}