import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Projects() {
const navigate = useNavigate();
const [deployments, setDeployments] = useState([]);
const [loading, setLoading] = useState(false);

const [teams, setTeams] = useState([]);
const [selectedTeam, setSelectedTeam] = useState("");

const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState("");

const [newProjectName, setNewProjectName] = useState("");
const [newRepoUrl, setNewRepoUrl] = useState("");

const [user, setUser] = useState(null);

// USER
useEffect(() => {
const loadUser = async () => {
const { data } = await supabase.auth.getUser();
setUser(data.user);
};
loadUser();
}, []);

// TEAMS
useEffect(() => {
const fetchTeams = async () => {
const res = await fetch("/api/getTeams");
const data = await res.json();
setTeams(data.teams || []);
};
fetchTeams();
}, []);

// PROJECTS
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
setDeployments([]);


}, [selectedTeam]);

// DEPLOYMENTS (ONLY WHEN PROJECT SELECTED ✅)
useEffect(() => {
if (!selectedProject) {
setDeployments([]);
return;
}


setLoading(true);

const fetchDeployments = async () => {
  try {
    const res = await fetch(
      `/api/getDeployments?projectId=${selectedProject}`
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
    console.error(err);
  }
};

fetchDeployments();

}, [selectedProject]);

// CREATE PROJECT
const handleCreateProject = async () => {
if (!newProjectName || !newRepoUrl || !selectedTeam) {
alert("Fill all fields");
return;
}


if (!user) {
  alert("User not loaded yet");
  return;
}

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

};

// DEPLOY
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

};

return ( <div style={container}> <h1 style={title}>🚀 Projects</h1>

  {/* CREATE */}
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
  </div>

  {/* DEPLOY */}
  <div style={card}>
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
      📂 Open Project
    </button>

    <button onClick={handleDeploy} style={primaryBtn}>
      🚀 Deploy
    </button>
  </div>

  {/* DEPLOYMENTS */}
  {selectedProject && (
    <>
      <h3 style={{ marginTop: 30 }}>Deployments</h3>

      {loading ? (
        <p>Loading...</p>
      ) : deployments.length === 0 ? (
        <p style={{ color: "#64748b" }}>No deployments yet</p>
      ) : (
        deployments.map((d) => (
          <div key={d.id} style={deployCard}>
            <strong>{d.id}</strong>

            <div style={status(d.status)}>
              {d.status}
            </div>

            <div style={logs}>{d.logs}</div>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank" style={link}>
                🌍 Open Deployment
              </a>
            )}
          </div>
        ))
      )}
    </>
  )}
</div>

);
}

/* 🎨 UI */

const container = {
padding: 40,
background: "#f8fafc",
minHeight: "100vh",
};

const title = { fontSize: 28, marginBottom: 20 };

const card = {
background: "#fff",
padding: 20,
borderRadius: 12,
border: "1px solid #e5e7eb",
marginBottom: 20,
maxWidth: 500,
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
borderRadius: 10,
border: "1px solid #e5e7eb",
};

const logs = {
background: "#0f172a",
color: "#e2e8f0",
padding: 10,
marginTop: 10,
borderRadius: 6,
fontSize: 12,
};

const link = {
display: "block",
marginTop: 10,
color: "#6366f1",
};

const status = (s) => ({
marginTop: 5,
color:
s === "READY"
? "#22c55e"
: s === "ERROR"
? "#ef4444"
: "#f59e0b",
});
