import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const params = new URLSearchParams(location.search);
    const teamIdFromUrl = params.get("teamId");

    if (teamIdFromUrl) {
      setSelectedTeam(teamIdFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();

        const res = await fetch("/api/getTeams", {
          headers: {
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        });

        const data = await res.json();

        const loadedTeams = data.teams || [];

        setTeams(loadedTeams);

        if (!selectedTeam && loadedTeams.length > 0) {
          setSelectedTeam(loadedTeams[0].id);
        }

      } catch {
        setTeams([]);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setProjects([]);
      setSelectedProject("");
      return;
    }

    fetch(`/api/getProjects?teamId=${selectedTeam}`)
      .then((res) => res.json())
      .then((data) => {
        const loadedProjects = data.projects || [];

        setProjects(loadedProjects);

        if (loadedProjects.length > 0) {
          setSelectedProject(loadedProjects[0].id);
        } else {
          setSelectedProject("");
        }
      })
      .catch(() => setProjects([]));
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedProject) {
      setDeployments([]);
      return;
    }

    setLoading(true);

    fetch(`/api/getDeployments?projectId=${selectedProject}`)
      .then((res) => res.json())
      .then((data) => {
        const safe = data.deployments || [];

        setDeployments(
          safe.map((d) => ({
            id: d.deployment_id,
            status: d.status,
            url: d.url || null,
            logs: d.logs || "",
          }))
        );

        setLoading(false);
      })
      .catch(() => {
        setDeployments([]);
        setLoading(false);
      });
  }, [selectedProject]);

  const handleCreateProject = async () => {
    if (!newProjectName || !newRepoUrl || !selectedTeam) {
      return alert("Fill all fields");
    }

    if (!user) return alert("User not loaded yet");

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

    if (!res.ok) return alert(data.error);

    setProjects((prev) => [data.project, ...prev]);

    setNewProjectName("");
    setNewRepoUrl("");

    setSelectedProject(data.project.id);

    alert("✅ Project created!");
  };

  const handleDeploy = async () => {
    if (!user) return alert("User not loaded");

    const p = projects.find((x) => x.id === selectedProject);

    if (!p) return alert("Select project");

    const res = await fetch("/api/deployProject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repoUrl: p.repo_url,
        projectName: p.name,
        teamId: selectedTeam,
        projectId: selectedProject,
        userId: user.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    setDeployments((prev) => [
      {
        id: data.deploymentId,
        status: "BUILDING",
        logs: "🚀 Starting deployment...",
        url: null,
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    if (!deployments.length) return;

    const interval = setInterval(fetchStatuses, 3000);

    return () => clearInterval(interval);
  }, [deployments]);

  const fetchStatuses = async () => {
    const updated = await Promise.all(
      deployments.map(async (d) => {
        if (["READY", "ERROR"].includes(d.status)) {
          return d;
        }

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
      <div style={content}>

        <h1 style={title}>🚀 Projects</h1>

        <div style={hero}>
          <h2 style={{ marginTop: 0 }}>
            Deploy your app in 3 steps
          </h2>

          <div style={steps}>
            <div style={step}>1️⃣ Create or select a project</div>
            <div style={step}>2️⃣ Connect your GitHub repository</div>
            <div style={step}>3️⃣ Click Deploy 🚀</div>
          </div>
        </div>

        <div style={card}>
          <h3>Create New Project</h3>

          <select
            style={input}
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Select Team</option>

            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            style={input}
            placeholder="My SaaS App"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />

          <input
            style={input}
            placeholder="https://github.com/your/repository"
            value={newRepoUrl}
            onChange={(e) => setNewRepoUrl(e.target.value)}
          />

          <button style={primary} onClick={handleCreateProject}>
            ➕ Create Project
          </button>
        </div>

        <div style={card}>
          <h3>Deploy Existing Project</h3>

          <select
            style={input}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select Project</option>

            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div style={buttonRow}>
            <button
              style={secondary}
              onClick={() => {
                if (!selectedProject) {
                  return alert("Select a project first");
                }

                navigate(`/projects/${selectedProject}`);
              }}
            >
              📂 Open Project
            </button>

            <button style={primary} onClick={handleDeploy}>
              🚀 Deploy Now
            </button>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <h2>Recent Deployments</h2>

          {!selectedProject && (
            <div style={emptyState}>
              Select a project to see deployments
            </div>
          )}

          {loading ? (
            <div style={emptyState}>Loading deployments...</div>
          ) : (
            deployments.map((d) => (
              <div key={d.id} style={deployCard}>
                <div style={deployTop}>
                  <div>
                    <div style={deployId}>{d.id}</div>

                    <div style={status(d.status)}>
                      {d.status}
                    </div>
                  </div>

                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      style={liveLink}
                    >
                      Open Deployment
                    </a>
                  )}
                </div>

                <div style={logs}>
                  {d.logs}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

/* STYLES */

const container = {
  background: "#f8fafc",
  minHeight: "100vh",
  padding: 32,
};

const content = {
  maxWidth: 1000,
};

const title = {
  fontSize: 32,
  marginBottom: 24,
};

const hero = {
  background: "white",
  padding: 24,
  borderRadius: 18,
  marginBottom: 24,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const steps = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 18,
};

const step = {
  background: "#f8fafc",
  padding: 14,
  borderRadius: 10,
  fontWeight: 500,
};

const card = {
  background: "white",
  padding: 24,
  borderRadius: 18,
  marginBottom: 24,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #dbeafe",
  fontSize: 14,
  boxSizing: "border-box",
};

const primary = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  color: "white",
  fontWeight: 700,
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
};

const secondary = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #c7d2fe",
  background: "#eef2ff",
  cursor: "pointer",
  fontWeight: 600,
};

const buttonRow = {
  display: "flex",
  gap: 12,
};

const deployCard = {
  background: "white",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const deployTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

const deployId = {
  fontWeight: 700,
  marginBottom: 6,
};

const logs = {
  background: "#0f172a",
  color: "#e2e8f0",
  padding: 14,
  borderRadius: 10,
  fontSize: 13,
  overflowX: "auto",
};

const liveLink = {
  padding: "10px 14px",
  background: "#6366f1",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
};

const emptyState = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  color: "#64748b",
};

const status = (s) => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background:
    s === "READY"
      ? "#dcfce7"
      : s === "BUILDING"
      ? "#fef3c7"
      : "#fee2e2",
});