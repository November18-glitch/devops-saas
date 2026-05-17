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

  // 👤 LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    loadUser();
  }, []);

  // 🔥 READ TEAM FROM URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const teamIdFromUrl = params.get("teamId");

    if (teamIdFromUrl) {
      setSelectedTeam(teamIdFromUrl);
    }
  }, [location.search]);

  // 👥 LOAD TEAMS
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

        // 🔥 AUTO SELECT FIRST TEAM
        if (!selectedTeam && loadedTeams.length > 0) {
          setSelectedTeam(loadedTeams[0].id);
        }

      } catch {
        setTeams([]);
      }
    };

    fetchTeams();
  }, []);

  // 📦 LOAD PROJECTS
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

        // 🔥 AUTO SELECT FIRST PROJECT
        if (loadedProjects.length > 0) {
          setSelectedProject(loadedProjects[0].id);
        } else {
          setSelectedProject("");
        }
      })
      .catch(() => setProjects([]));
  }, [selectedTeam]);

  // 🚀 LOAD DEPLOYMENTS
  useEffect(() => {
    if (!selectedProject) {
      setDeployments([]);
      setLoading(false);
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

  // ➕ CREATE PROJECT
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

    // 🔥 AUTO SELECT NEW PROJECT
    setSelectedProject(data.project.id);

    alert("✅ Project created!");
  };

  // 🚀 DEPLOY
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

  // 🔄 POLLING
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
      <h1 style={title}>🚀 Projects</h1>

      {/* 🔥 ONBOARDING */}
      <div style={onboardingCard}>
        <h3 style={{ marginTop: 0 }}>
          Quick Start Guide
        </h3>

        <div style={steps}>
          <div style={step}>
            ✅ Team ready
          </div>

          <div style={step}>
            ✅ Sample project created
          </div>

          <div style={step}>
            🚀 Deploy your app below
          </div>
        </div>
      </div>

      <div style={card}>
        <h3>Create Project</h3>

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
          placeholder="Project Name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />

        <input
          style={input}
          placeholder="GitHub URL"
          value={newRepoUrl}
          onChange={(e) => setNewRepoUrl(e.target.value)}
        />

        <button style={primary} onClick={handleCreateProject}>
          ➕ Create Project
        </button>

        <hr style={{ margin: "20px 0" }} />

        <h3>Deploy</h3>

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
          🚀 Deploy
        </button>
      </div>

      <h3 style={{ marginTop: 40 }}>
        Deployments
      </h3>

      {!selectedProject && (
        <p>Select a project to see deployments</p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : deployments.map((d) => (
        <div key={d.id} style={deployCard}>
          <b>{d.id}</b>

          <p>
            Status:{" "}
            <span style={{ fontWeight: "bold" }}>
              {d.status}
            </span>
          </p>

          {d.url && (
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              style={liveLink}
            >
              🔗 Open Deployment
            </a>
          )}

          <div style={logs}>
            {d.logs}
          </div>
        </div>
      ))}
    </div>
  );
}

/* UI */

const container = {
  padding: 40,
  background: "#f1f5f9",
  minHeight: "100vh",
};

const title = {
  fontSize: 28,
  marginBottom: 20,
};

const onboardingCard = {
  background: "white",
  padding: 20,
  borderRadius: 16,
  marginBottom: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  maxWidth: 600,
};

const steps = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const step = {
  background: "#f8fafc",
  padding: 12,
  borderRadius: 10,
};

const card = {
  background: "white",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  maxWidth: 600,
};

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const primary = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  border: "none",
  marginTop: 10,
  cursor: "pointer",
};

const secondary = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  background: "#eef2ff",
  border: "1px solid #c7d2fe",
  marginTop: 10,
};

const deployCard = {
  background: "white",
  padding: 16,
  marginTop: 12,
  borderRadius: 12,
};

const logs = {
  background: "#f1f5f9",
  padding: 10,
  marginTop: 10,
  fontSize: 12,
  borderRadius: 6,
};

const liveLink = {
  display: "inline-block",
  marginTop: 10,
  color: "#6366f1",
  fontWeight: 600,
  textDecoration: "none",
};