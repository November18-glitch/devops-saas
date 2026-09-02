import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [envVars, setEnvVars] = useState([
  {
    key: "",
    value: "",
  },
]);

  const [newProjectName, setNewProjectName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");

  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("FREE");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      if (data.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("plan")
          .eq("id", data.user.id)
          .single();

        setPlan(profile?.plan || "FREE");
      }
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
        let session = (await supabase.auth.getSession()).data.session;

if (!session) {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));

    session = (await supabase.auth.getSession()).data.session;

    if (session) break;
  }
}

if (!session) {
  console.error("No Supabase session.");
  return;
}

const res = await fetch("/api/app?action=getTeams", {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
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

    fetch(
     `/api/app?action=getProjects&teamId=${selectedTeam}`
    )
      .then((res) => res.json())
      .then((data) => {
        const loadedProjects = data.projects || [];

        setProjects(loadedProjects);

        if (loadedProjects.length > 0) {
         const first = loadedProjects[0];

          if (first.env_vars) {
           setEnvVars(
            Object.entries(first.env_vars).map(
            ([key, value]) => ({
             key,
             value,
            })
           )
            );
        }
      }

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

    fetch(
    `/api/app?action=getDeployments&projectId=${selectedProject}`
    )
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
    if (plan === "FREE" && projects.length >= 1) {
     return alert(
      "Free plan allows only 1 project.\nUpgrade to Pro for unlimited projects."
     );
     }

     const formattedEnv = {};

      envVars.forEach((env) => {
      if (env.key.trim()) {
       formattedEnv[env.key] = env.value;
      }
     });

    const res = await fetch("/api/app?action=createProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newProjectName,
        repoUrl: newRepoUrl,
        teamId: selectedTeam,
        userId: user.id,
        envVars: formattedEnv,
      }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    setProjects((prev) => [data.project, ...prev]);

    setNewProjectName("");
    setNewRepoUrl("");

    setEnvVars([
     {
       key: "",
       value: "",
     },
    ]);

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

    if (!res.ok) {

    setDeployments(
    (prev)=>[
    {
    id:`failed-${Date.now()}`,

    status:"ERROR",

    url:null,

    logs:
    data.error ||
    "Deployment failed",
    },
    ...prev
    ]
    );

    return;
    }

    setDeployments((prev) => [
      {
        id:
         data.deploymentId,

        localId:
         data.localDeploymentId,
        status: "BUILDING",

        logs: `
🚀 Starting deployment...

Framework: ${data.analysis?.framework || "unknown"}

Build Command:
${data.analysis?.buildCommand || "Not detected"}

Install Command:
${data.analysis?.installCommand || "Not detected"}

Output Directory:
${data.analysis?.outputDirectory || "default"}

Detected:
${data.analysis?.detected?.join(", ") || "None"}
        `.trim(),

        url: null,
      },
      ...prev,
    ]);
  };
  const deleteProject = async (project) => {
  const confirmed = window.confirm(
    `Delete ${project.name}?`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);

  if (error) {
    alert(error.message);
    return;
  }

  setProjects((prev) =>
    prev.filter((p) => p.id !== project.id)
  );

  if (selectedProject === project.id) {
    setSelectedProject("");
  }
};

  useEffect(() => {
  const active =
    deployments.some(
      (d) =>
        d.status !== "READY" &&
        d.status !== "ERROR"
    );

  if (!active) {
    return;
  }

  const interval =
    setTimeout(() => {
      fetchStatuses();
    }, 10000);

  return () =>
    clearTimeout(interval);

}, [
  deployments
    .map(
      (d) =>
        `${d.id}-${d.status}`
    )
    .join("|"),
]);

  const fetchStatuses =
  async () => {
  const updated =
  await Promise.all(
  deployments.map(
  async (d) => {
  if (
  d.status ===
  "READY" ||
  d.status ===
  "ERROR"
  ) {
  return d;
  }

  try {
  const res =
  await fetch(
  `/api/deploymentStatus?id=${d.id}`
  );

  if (
  !res.ok
  ) {
  return d;
  }

  const data =
  await res.json();

  return {
  ...d,

  status:
  data.status ??
  d.status,

  url:
  data.url ??
  d.url,

  logs:
  data.logs ??
  d.logs,
  };

  } catch {
  return d;
  }
  }
  )
  );

  setDeployments(
  (prev) => {
    const changed =
      JSON.stringify(prev) !==
      JSON.stringify(updated);

    return changed
      ? updated
      : prev;
  }
  );
  };

  return (
  <div style={container}>
    <div style={content}>

      <h1 style={title}>🚀 Projects</h1>

      {/* HERO */}
      <div style={hero}>
        <h2 style={{ marginTop: 0, color: "var(--text)" }}>
          Deploy your app in 3 steps
        </h2>

        <div style={steps}>
          <div style={step}>
            1️⃣ Create or select a project
          </div>

          <div style={step}>
            2️⃣ Connect your GitHub repository
          </div>

          <div style={step}>
            3️⃣ Click Deploy 🚀
          </div>
        </div>
      </div>

      {/* CREATE PROJECT */}
      <div style={card}>
        <h3 style={cardTitle}>Create New Project</h3>

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

        <h3 style={cardTitle}>Environment Variables</h3>

        {envVars.map((env, index) => (
          <div
            key={index}
            style={envRow}
          >
            <input
              placeholder="KEY"
              value={env.key}
              onChange={(e) => {
                const updated = [...envVars];
                updated[index] = {
                  ...updated[index],
                  key: e.target.value,
                };
                setEnvVars(updated);
              }}
              style={{
                ...input,
                flex: 1,
                marginBottom: 0,
              }}
            />

            <input
              placeholder="VALUE"
              value={env.value}
              onChange={(e) => {
                const updated = [...envVars];
                updated[index] = {
                  ...updated[index],
                  value: e.target.value,
                };
                setEnvVars(updated);
              }}
              style={{
                ...input,
                flex: 2,
                marginBottom: 0,
              }}
            />

            <button
              type="button"
              onClick={() => {
                setEnvVars(
                  envVars.filter((_, i) => i !== index)
                );
              }}
              style={removeButton}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setEnvVars([
              ...envVars,
              {
                key: "",
                value: "",
              },
            ])
          }
          style={addVariableButton}
        >
          + Add Variable
        </button>

        <button
          style={primary}
          onClick={handleCreateProject}
        >
          ➕ Create Project
        </button>
      </div>

      {/* EXISTING PROJECTS */}
      <div style={card}>
        <h3 style={cardTitle}>Deploy Existing Project</h3>

        <div style={projectList}>
          {projects.length === 0 ? (
            <div style={emptyProject}>
              No projects yet. Create your first project above.
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={projectRow}
              >
                <div>
                  <b style={{ color: "var(--text)" }}>
                    {project.name}
                  </b>
                </div>

                <button
                  type="button"
                  onClick={() => deleteProject(project)}
                  style={deleteButton}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <select
          style={input}
          value={selectedProject}
          onChange={(e) => {
            const id = e.target.value;

            setSelectedProject(id);

            const project = projects.find(
              (p) => p.id === id
            );

            if (project?.env_vars) {
              setEnvVars(
                Object.entries(project.env_vars).map(
                  ([key, value]) => ({
                    key,
                    value,
                  })
                )
              );
            } else {
              setEnvVars([
                {
                  key: "",
                  value: "",
                },
              ]);
            }
          }}
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

          <button
            style={primary}
            onClick={handleDeploy}
          >
            🚀 Deploy Now
          </button>
        </div>
      </div>

      {/* RECENT DEPLOYMENTS */}
      <div style={recentSection}>
        <h2 style={sectionTitle}>
          Recent Deployments
        </h2>

        {!selectedProject && (
          <div style={emptyState}>
            Select a project to see deployments
          </div>
        )}

        {selectedProject && loading && (
          <div style={emptyState}>
            Loading deployments...
          </div>
        )}

        {selectedProject &&
          !loading &&
          deployments.length === 0 && (
            <div style={emptyState}>
              No deployments yet for this project.
            </div>
          )}

        {!loading &&
          deployments.map((d) => (
            <div
              key={d.id}
              style={deployCard}
            >
              <div style={deployTop}>
                <div>
                  <div style={deployId}>
                    {d.id}
                  </div>

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
                {d.logs || "No deployment logs available."}
              </div>
            </div>
          ))}
      </div>

    </div>
  </div>
);

}


/* =========================
   STYLES
========================= */

const container = {
  background: "var(--bg)",
  minHeight: "100vh",
  color: "var(--text)",
  padding: 32,
};

const content = {
  maxWidth: 1000,
  margin: "0 auto",
};

const title = {
  fontSize: 32,
  marginBottom: 24,
  color: "var(--text)",
  letterSpacing: "-0.5px",
};

const hero = {
  background:
    "linear-gradient(145deg, #101014 0%, #0d0d0f 100%)",
  border: "1px solid var(--border)",
  padding: 24,
  borderRadius: 18,
  marginBottom: 24,
  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
};

const steps = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 18,
};

const step = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text-soft)",
  padding: 14,
  borderRadius: 10,
  fontWeight: 500,
};

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: 24,
  borderRadius: 18,
  marginBottom: 24,
  boxShadow: "0 10px 35px rgba(0,0,0,0.22)",
};

const cardTitle = {
  marginTop: 0,
  marginBottom: 16,
  color: "var(--text)",
};

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "#09090b",
  color: "var(--text)",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  colorScheme: "dark",
};

const envRow = {
  display: "flex",
  gap: 10,
  marginBottom: 10,
  alignItems: "center",
};

const removeButton = {
  flexShrink: 0,
  width: 42,
  height: 42,
  borderRadius: 9,
  border: "1px solid #7f1d1d",
  background: "var(--danger-bg)",
  color: "#fca5a5",
  cursor: "pointer",
  fontWeight: 700,
};

const addVariableButton = {
  width: "100%",
  padding: 12,
  marginBottom: 16,
  borderRadius: 10,
  border: "1px dashed var(--border)",
  background: "var(--surface-2)",
  color: "var(--text-soft)",
  cursor: "pointer",
  fontWeight: 600,
};

const primary = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(139,92,246,0.35)",
  cursor: "pointer",
  color: "white",
  fontWeight: 700,
  background:
    "linear-gradient(135deg, var(--accent-2), var(--accent))",
  boxShadow:
    "0 8px 24px rgba(99,102,241,0.18)",
};

const secondary = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontWeight: 700,
  color: "var(--text-soft)",
  background: "var(--surface-2)",
};

const buttonRow = {
  display: "flex",
  gap: 12,
};

const projectList = {
  marginBottom: 20,
};

const projectRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  marginBottom: 10,
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 12,
};

const deleteButton = {
  background: "var(--danger-bg)",
  color: "#fca5a5",
  border: "1px solid #7f1d1d",
  borderRadius: 8,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 600,
};

const emptyProject = {
  padding: 14,
  marginBottom: 10,
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--muted)",
};

const recentSection = {
  marginTop: 30,
};

const sectionTitle = {
  color: "var(--text)",
  marginBottom: 16,
};

const deployCard = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
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
  color: "var(--text)",
};

const logs = {
  background: "#08080a",
  border: "1px solid var(--border)",
  color: "#c4c4ce",
  padding: 14,
  borderRadius: 10,
  fontSize: 13,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const liveLink = {
  padding: "10px 14px",
  background: "var(--accent-2)",
  color: "white",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
};

const emptyState = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  padding: 20,
  borderRadius: 14,
  color: "var(--muted)",
};

const status = (s) => ({
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,

  background:
    s === "READY"
      ? "var(--success-bg)"
      : s === "BUILDING"
      ? "var(--warning-bg)"
      : "var(--danger-bg)",

  color:
    s === "READY"
      ? "#86efac"
      : s === "BUILDING"
      ? "#fcd34d"
      : "#fca5a5",

  border:
    s === "READY"
      ? "1px solid #14532d"
      : s === "BUILDING"
      ? "1px solid #78350f"
      : "1px solid #7f1d1d",
});