import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Projects() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [newProjectName, setNewProjectName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch("/api/getTeams");
      const data = await res.json();
      setTeams(data.teams || []);
    };
    fetchTeams();
  }, []);

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
    setSelectedProject("");
  }, [selectedTeam]);

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
  }, [selectedTeam, selectedProject]);

  const handleCreateProject = async () => {
    if (!newProjectName || !newRepoUrl || !selectedTeam) {
      alert("Fill all fields");
      return;
    }

    if (!user) {
      alert("User not loaded yet");
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
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setProjects((prev) => [data.project, ...prev]);

      setNewProjectName("");
      setNewRepoUrl("");

      alert("✅ Project created!");
    } catch (err) {
      console.error(err);
      alert("Create project failed");
    }
  };

  const handleDeploy = async () => {
    const selectedProjectData = projects.find(
      (p) => p.id === selectedProject
    );

    if (!selectedProjectData) {
      alert("Select a project");
      return;
    }

    if (!user) {
      alert("User not loaded yet");
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
        userId: user.id,
      }),
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

    const resReload = await fetch(
      `/api/getDeployments?projectId=${selectedProject}`
    );
    const dataReload = await resReload.json();

    setDeployments(
      dataReload.deployments.map((d) => ({
        id: d.deployment_id,
        status: d.status,
        url: d.url || null,
        logs: d.logs || "",
      }))
    );
  };

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
          logs: data.logs || d.logs,
        };
      })
    );

    setDeployments(updated);
  };

  return (
    <div style={container}>
      <h1 style={title}>🚀 Projects & Deployments</h1>

      {/* CREATE + DEPLOY CARD */}
      <div style={card}>
        <h3>Create Project</h3>

        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} style={input}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <input
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={input}
        />

        <input
          placeholder="GitHub Repo URL"
          value={newRepoUrl}
          onChange={(e) => setNewRepoUrl(e.target.value)}
          style={input}
        />

        <button onClick={handleCreateProject} style={primaryBtn}>
          ➕ Create Project
        </button>

        <hr style={{ margin: "25px 0" }} />

        <h3>Deploy</h3>

        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={input}>
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {selectedProject && (
          <p style={{ fontSize: 12, color: "#64748b" }}>
            Repo: {projects.find(p => p.id === selectedProject)?.repo_url}
          </p>
        )}

        <button onClick={() => navigate(`/projects/${selectedProject}`)} style={secondaryBtn}>
          📂 Open Project Page
        </button>

        <button onClick={handleDeploy} style={primaryBtn}>
          🚀 Deploy
        </button>
      </div>

      {/* DEPLOYMENTS */}
      <h3 style={{ marginTop: 40 }}>Deployments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        deployments.map((d) => (
          <div key={d.id} style={deployCard}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{d.id}</strong>
              <span style={statusBadge(d.status)}>{d.status}</span>
            </div>

            <div style={logBox}>{d.logs}</div>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank" style={link}>
                🌍 Open Deployment
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* 🎨 STYLES */

const container = {
  padding: 40,
  background: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
};

const title = {
  fontSize: 28,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 25,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  maxWidth: 600,
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

const primaryBtn = {
  width: "100%",
  padding: 12,
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: 10,
  marginTop: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryBtn = {
  ...primaryBtn,
  background: "#e2e8f0",
  color: "#0f172a",
};

const deployCard = {
  background: "#fff",
  padding: 15,
  marginTop: 10,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const logBox = {
  background: "#0f172a",
  color: "#e2e8f0",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "monospace",
};

const link = {
  display: "block",
  marginTop: 10,
  color: "#6366f1",
  fontWeight: 500,
};

const statusBadge = (status) => ({
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  color: "white",
  background:
    status === "READY"
      ? "#22c55e"
      : status === "ERROR"
      ? "#ef4444"
      : "#f59e0b",
});