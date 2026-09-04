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

      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <div>
          <div style={eyebrow}>
            DEPLOYMENT PLATFORM
          </div>

          <h1 style={title}>
            Projects
          </h1>

          <p style={subtitle}>
            Build, configure, and deploy your applications
            from one workspace.
          </p>
        </div>

        <div style={headerBadge}>
          <span style={onlineDot}></span>
          Deployment engine online
        </div>
      </div>

      {/* DEPLOYMENT PIPELINE */}
      <div style={hero}>
        <div style={heroGlow}></div>

        <div style={heroContent}>
          <div style={heroLabel}>
            YOUR DEPLOYMENT PIPELINE
          </div>

          <h2 style={heroTitle}>
            From repository to production.
          </h2>

          <p style={heroSubtitle}>
            LaunchAlly analyzes your application,
            prepares the environment, and handles
            the deployment flow.
          </p>

          <div style={steps}>
            <div style={step}>
              <div style={stepNumber}>01</div>
              <div>
                <strong>Create</strong>
                <span>Create or select a project.</span>
              </div>
            </div>

            <div style={stepLine}></div>

            <div style={step}>
              <div style={stepNumber}>02</div>
              <div>
                <strong>Connect</strong>
                <span>Connect your GitHub repository.</span>
              </div>
            </div>

            <div style={stepLine}></div>

            <div style={step}>
              <div style={stepNumber}>03</div>
              <div>
                <strong>Deploy</strong>
                <span>Analyze, build, and launch.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PROJECT */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <div style={sectionEyebrow}>
              NEW APPLICATION
            </div>

            <h3 style={cardTitle}>
              Create New Project
            </h3>

            <p style={cardDescription}>
              Connect a repository and configure your
              deployment environment.
            </p>
          </div>

          <div style={cardIcon}>＋</div>
        </div>

        <label style={label}>
          Team
        </label>

        <select
          style={input}
          value={selectedTeam}
          onChange={(e) =>
            setSelectedTeam(e.target.value)
          }
        >
          <option value="">Select Team</option>

          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label style={label}>
          Project Name
        </label>

        <input
          style={input}
          placeholder="My SaaS App"
          value={newProjectName}
          onChange={(e) =>
            setNewProjectName(e.target.value)
          }
        />

        <label style={label}>
          GitHub Repository
        </label>

        <input
          style={input}
          placeholder="https://github.com/your/repository"
          value={newRepoUrl}
          onChange={(e) =>
            setNewRepoUrl(e.target.value)
          }
        />

        <div style={environmentHeader}>
          <div>
            <h3 style={environmentTitle}>
              Environment Variables
            </h3>

            <p style={environmentSubtitle}>
              Configure values your application needs at runtime.
            </p>
          </div>
        </div>

        <div style={envContainer}>
          {envVars.map((env, index) => (
            <div key={index} style={envRow}>
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
                    envVars.filter(
                      (_, i) => i !== index
                    )
                  );
                }}
                style={removeButton}
              >
                ×
              </button>
            </div>
          ))}
        </div>

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
          <span>＋</span>
          Add environment variable
        </button>

        <button
          style={primary}
          onClick={handleCreateProject}
        >
          Create Project
          <span>→</span>
        </button>
      </div>

      {/* EXISTING PROJECTS */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <div style={sectionEyebrow}>
              WORKSPACE
            </div>

            <h3 style={cardTitle}>
              Deploy Existing Project
            </h3>

            <p style={cardDescription}>
              Select an existing project to inspect or deploy.
            </p>
          </div>
        </div>

        <div style={projectList}>
          {projects.length === 0 ? (
            <div style={emptyProject}>
              <div style={emptyProjectIcon}>📦</div>

              <div>
                <strong>No projects yet</strong>
                <span>
                  Create your first project above.
                </span>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={projectRow}
              >
                <div style={projectInfo}>
                  <div style={projectSmallIcon}>
                    🚀
                  </div>

                  <div>
                    <b style={projectName}>
                      {project.name}
                    </b>

                    <span style={projectRepo}>
                      {project.repo_url}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    deleteProject(project)
                  }
                  style={deleteButton}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <label style={label}>
          Selected Project
        </label>

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
                return alert(
                  "Select a project first"
                );
              }

              navigate(
                `/projects/${selectedProject}`
              );
            }}
          >
            Open Project
            <span>→</span>
          </button>

          <button
            style={primary}
            onClick={handleDeploy}
          >
            Deploy Now
            <span>🚀</span>
          </button>
        </div>
      </div>

      {/* RECENT DEPLOYMENTS */}
      <div style={recentSection}>
        <div style={recentHeader}>
          <div>
            <div style={sectionEyebrow}>
              OPERATIONS
            </div>

            <h2 style={sectionTitle}>
              Recent Deployments
            </h2>

            <p style={sectionSubtitle}>
              Deployment status, logs, and production URLs.
            </p>
          </div>
        </div>

        {!selectedProject && (
          <div style={emptyState}>
            <div style={emptyStateIcon}>⌁</div>

            <h3>Select a project</h3>

            <p>
              Choose a project above to inspect its
              deployment history.
            </p>
          </div>
        )}

        {selectedProject && loading && (
          <div style={emptyState}>
            <div style={loader}></div>

            <h3>Loading deployments...</h3>

            <p>
              Synchronizing deployment history.
            </p>
          </div>
        )}

        {selectedProject &&
          !loading &&
          deployments.length === 0 && (
            <div style={emptyState}>
              <div style={emptyStateIcon}>
                🚀
              </div>

              <h3>No deployments yet</h3>

              <p>
                Deploy this project to start building
                your deployment history.
              </p>
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
                  <div style={deploymentIdRow}>
                    <span style={terminalDot}></span>

                    <div style={deployId}>
                      {d.id}
                    </div>
                  </div>

                  <div style={deployDate}>
                    {d.createdAt
                      ? new Date(
                          d.createdAt
                        ).toLocaleString()
                      : "Recently created"}
                  </div>
                </div>

                <div style={status(d.status)}>
                  <span style={statusDot}></span>
                  {d.status}
                </div>
              </div>

              <div style={logsHeader}>
                <span>BUILD OUTPUT</span>
              </div>

              <div style={logs}>
                {d.logs ||
                  "No deployment logs available."}
              </div>

              {d.url && (
                <div style={deploymentFooter}>
                  <div style={liveIndicator}>
                    <span></span>
                    Live deployment available
                  </div>

                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    style={liveLink}
                  >
                    Open Deployment
                    <span>↗</span>
                  </a>
                </div>
              )}
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
  padding: "34px 28px 60px",
};

const content = {
  maxWidth: 1050,
  margin: "0 auto",
};

const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  marginBottom: 26,
  flexWrap: "wrap",
};

const eyebrow = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 850,
  letterSpacing: "1.5px",
  marginBottom: 7,
};

const title = {
  fontSize: 32,
  margin: 0,
  color: "var(--text)",
  letterSpacing: "-0.8px",
  fontWeight: 850,
};

const subtitle = {
  margin: "7px 0 0",
  color: "var(--muted)",
  fontSize: 14,
};

const headerBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "8px 11px",
  borderRadius: 999,
  background: "#0b1d13",
  border: "1px solid #164e2a",
  color: "#86efac",
  fontSize: 10,
  fontWeight: 800,
};

const onlineDot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#22c55e",
  boxShadow: "0 0 9px rgba(34,197,94,.65)",
};

const hero = {
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(145deg, #111116 0%, #0b0b0e 70%, #100b1d 100%)",
  border: "1px solid #292934",
  padding: 27,
  borderRadius: 20,
  marginBottom: 22,
  boxShadow: "0 20px 60px rgba(0,0,0,.30)",
};

const heroGlow = {
  position: "absolute",
  width: 300,
  height: 300,
  right: -100,
  top: -150,
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(124,58,237,.18), transparent 68%)",
};

const heroContent = {
  position: "relative",
  zIndex: 1,
};

const heroLabel = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 850,
  letterSpacing: "1.5px",
  marginBottom: 8,
};

const heroTitle = {
  margin: 0,
  fontSize: 23,
  color: "#fafafa",
  fontWeight: 850,
  letterSpacing: "-.5px",
};

const heroSubtitle = {
  maxWidth: 620,
  margin: "8px 0 23px",
  color: "#8b8b96",
  fontSize: 13,
  lineHeight: 1.6,
};

const steps = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const step = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 13px",
  background: "#09090c",
  border: "1px solid #262630",
  borderRadius: 11,
};

const stepNumber = {
  color: "#a78bfa",
  fontSize: 10,
  fontWeight: 900,
  fontFamily: "ui-monospace, monospace",
};

const stepLine = {
  width: 20,
  height: 1,
  background: "#33333d",
};

const card = {
  background:
    "linear-gradient(145deg, #101014 0%, #0c0c0f 100%)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  padding: 25,
  borderRadius: 18,
  marginBottom: 22,
  boxShadow: "0 12px 40px rgba(0,0,0,.20)",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
  marginBottom: 22,
};

const sectionEyebrow = {
  color: "#8b5cf6",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1.4px",
  marginBottom: 6,
};

const cardTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 18,
  fontWeight: 800,
};

const cardDescription = {
  margin: "5px 0 0",
  color: "var(--muted)",
  fontSize: 12,
};

const cardIcon = {
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  background: "#181326",
  border: "1px solid #30234c",
  color: "#c4b5fd",
  fontSize: 18,
};

const label = {
  display: "block",
  color: "#b8b8c2",
  fontSize: 11,
  fontWeight: 700,
  marginBottom: 7,
};

const input = {
  width: "100%",
  padding: "12px 13px",
  marginBottom: 16,
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "#08080b",
  color: "var(--text)",
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
  colorScheme: "dark",
};

const environmentHeader = {
  paddingTop: 6,
  marginBottom: 13,
};

const environmentTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 14,
  fontWeight: 800,
};

const environmentSubtitle = {
  margin: "4px 0 0",
  color: "var(--muted)",
  fontSize: 11,
};

const envContainer = {
  padding: 12,
  background: "#09090c",
  border: "1px solid #24242d",
  borderRadius: 12,
  marginBottom: 10,
};

const envRow = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
  alignItems: "center",
};

const removeButton = {
  flexShrink: 0,
  width: 40,
  height: 40,
  borderRadius: 9,
  border: "1px solid #7f1d1d",
  background: "var(--danger-bg)",
  color: "#fca5a5",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 18,
};

const addVariableButton = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  padding: 11,
  marginBottom: 16,
  borderRadius: 10,
  border: "1px dashed #353541",
  background: "#0b0b0f",
  color: "#aaaab5",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};

const primary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  width: "100%",
  padding: 13,
  borderRadius: 11,
  border: "1px solid rgba(139,92,246,.35)",
  cursor: "pointer",
  color: "white",
  fontWeight: 750,
  background:
    "linear-gradient(135deg, var(--accent-2), var(--accent))",
  boxShadow: "0 10px 25px rgba(99,102,241,.15)",
};

const projectList = {
  marginBottom: 18,
};

const projectRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 13,
  marginBottom: 8,
  background: "#09090c",
  border: "1px solid #24242d",
  borderRadius: 11,
};

const projectInfo = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const projectSmallIcon = {
  width: 32,
  height: 32,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#17141f",
  border: "1px solid #30234c",
  borderRadius: 8,
  fontSize: 13,
};

const projectName = {
  display: "block",
  color: "var(--text)",
  fontSize: 13,
};

const projectRepo = {
  display: "block",
  color: "#62626d",
  fontSize: 10,
  marginTop: 3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 550,
};

const deleteButton = {
  flexShrink: 0,
  background: "var(--danger-bg)",
  color: "#fca5a5",
  border: "1px solid #7f1d1d",
  borderRadius: 8,
  padding: "7px 10px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
};

const emptyProject = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 15,
  background: "#09090c",
  border: "1px dashed #30303a",
  borderRadius: 11,
  color: "var(--muted)",
};

const emptyProjectIcon = {
  fontSize: 18,
};

const buttonRow = {
  display: "flex",
  gap: 10,
};

const secondary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  flex: 1,
  padding: 13,
  borderRadius: 11,
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontWeight: 700,
  color: "var(--text-soft)",
  background: "var(--surface-2)",
};

const recentSection = {
  marginTop: 36,
};

const recentHeader = {
  marginBottom: 15,
};

const sectionTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 20,
  fontWeight: 800,
};

const sectionSubtitle = {
  margin: "5px 0 0",
  color: "var(--muted)",
  fontSize: 12,
};

const emptyState = {
  textAlign: "center",
  background: "#0b0b0f",
  border: "1px dashed #30303a",
  padding: "42px 20px",
  borderRadius: 15,
  color: "var(--muted)",
};

const emptyStateIcon = {
  fontSize: 28,
  marginBottom: 8,
};

const loader = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "3px solid #292933",
  borderTopColor: "#8b5cf6",
  margin: "0 auto 12px",
  animation: "spin 1s linear infinite",
};

const deployCard = {
  background:
    "linear-gradient(145deg, #101014, #0c0c0f)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: 16,
  padding: 19,
  marginBottom: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,.18)",
};

const deployTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  marginBottom: 15,
};

const deploymentIdRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const terminalDot = {
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: "#8b5cf6",
  boxShadow: "0 0 10px rgba(139,92,246,.5)",
};

const deployId = {
  fontWeight: 750,
  fontSize: 13,
  color: "var(--text)",
  fontFamily: "ui-monospace, monospace",
};

const deployDate = {
  fontSize: 10,
  color: "#62626d",
  marginTop: 5,
};

const status = (s) => {
  const normalized = (s || "").toUpperCase();

  const ready =
    normalized === "READY" ||
    normalized === "SUCCESS" ||
    normalized === "ACTIVE";

  const building =
    normalized === "BUILDING" ||
    normalized === "PENDING" ||
    normalized === "ANALYZING";

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 9px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 850,
    background: ready
      ? "#0b2115"
      : building
      ? "#211b0b"
      : "#261010",
    color: ready
      ? "#86efac"
      : building
      ? "#fcd34d"
      : "#fca5a5",
    border: ready
      ? "1px solid #14532d"
      : building
      ? "1px solid #713f12"
      : "1px solid #7f1d1d",
  };
};

const statusDot = {
  width: 5,
  height: 5,
  borderRadius: "50%",
  background: "currentColor",
};

const logsHeader = {
  color: "#62626d",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1px",
  marginBottom: 6,
};

const logs = {
  background: "#07070a",
  border: "1px solid #202027",
  color: "#b8b8c2",
  padding: 14,
  borderRadius: 10,
  fontSize: 11,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  lineHeight: 1.65,
  maxHeight: 190,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const deploymentFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 12,
};

const liveIndicator = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "#86efac",
  fontSize: 10,
  fontWeight: 700,
};

const liveLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  padding: "9px 12px",
  background: "#17141f",
  border: "1px solid #30234c",
  color: "#c4b5fd",
  borderRadius: 9,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 11,
};