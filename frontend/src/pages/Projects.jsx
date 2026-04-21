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
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>🚀 Projects & Deployments</h1>

      {/* CARD */}
      <div style={card}>
        <h3>Create Project</h3>

        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} style={input}>
          <option value="">Select Team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <input placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} style={input} />
        <input placeholder="GitHub Repo URL" value={newRepoUrl} onChange={(e) => setNewRepoUrl(e.target.value)} style={input} />

        <button onClick={handleCreateProject} style={primaryBtn}>➕ Create Project</button>

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

        <button onClick={() => {
          if (!selectedProject) return alert("Select a project first");
          navigate(`/projects/${selectedProject}`);
        }} style={secondaryBtn}>
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
            <p style={{ fontWeight: "bold" }}>{d.id}</p>

            <p>
              Status:{" "}
              <span style={{
                color:
                  d.status === "READY"
                    ? "#22c55e"
                    : d.status === "ERROR"
                    ? "#ef4444"
                    : "#facc15",
                fontWeight: "bold"
              }}>
                {d.status}
              </span>
            </p>

            <div style={logBox}>{d.logs}</div>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank" style={{ color: "#6366f1", marginTop: 10, display: "block" }}>
                🌍 Open Deployment
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* STYLES */

const card = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  maxWidth: 600
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #e2e8f0"
};

const primaryBtn = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: 10
};

const secondaryBtn = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #cbd5f5",
  background: "#eef2ff",
  cursor: "pointer",
  marginTop: 10
};

const deployCard = {
  background: "white",
  padding: 16,
  marginTop: 12,
  borderRadius: 12,
  boxShadow: "0 6px 20px rgba(0,0,0,0.04)"
};

const logBox = {
  background: "#f1f5f9",
  padding: 10,
  marginTop: 10,
  fontSize: 12,
  borderRadius: 6,
  maxHeight: 120,
  overflow: "auto"
};