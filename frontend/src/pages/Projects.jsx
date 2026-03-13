import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";

const API_BASE = "https://devops-saas.vercel.app";

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("code");

  const [teamId, setTeamId] = useState(null);
  const [teamRole, setTeamRole] = useState(null);

  const [creating, setCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [envVars, setEnvVars] = useState("{}");
  const [saving, setSaving] = useState(false);

  const [deployments, setDeployments] = useState([]);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data: memberships } = await supabase
        .from("team_members")
        .select("team_id, role")
        .eq("user_id", user.id)
        .limit(1);

      if (!memberships || memberships.length === 0)
        throw new Error("No team found");

      const membership = memberships[0];

      setTeamId(membership.team_id);
      setTeamRole(membership.role);

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("team_id", membership.team_id)
        .order("created_at", { ascending: false });

      setProjects(projectsData || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canEdit = ["owner", "admin", "developer"].includes(teamRole);
  const canDelete = ["owner", "admin"].includes(teamRole);

  function selectProject(project) {
    setSelectedProject(project);
    setActiveTab("code");
    setRepoUrl(project.repo_url || "");
    setBranch(project.default_branch || "main");
    setEnvVars(JSON.stringify(project.env_vars || {}, null, 2));
    setDeployments([]);
  }

  async function createProject() {
    if (!newProjectName.trim() || !teamId) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: newProjectName.trim(),
        team_id: teamId,
        default_branch: "main",
        env_vars: {},
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setProjects((prev) => [data, ...prev]);
    setNewProjectName("");
    setCreating(false);
    selectProject(data);
  }

  async function saveCode() {
    if (!canEdit || !selectedProject) return;

    let parsedEnv;

    try {
      parsedEnv = JSON.parse(envVars);
    } catch {
      alert("Environment variables must be valid JSON");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("projects")
      .update({
        repo_url: repoUrl,
        default_branch: branch,
        env_vars: parsedEnv,
      })
      .eq("id", selectedProject.id);

    setSaving(false);

    if (error) alert(error.message);
    else alert("Code settings saved ✅");
  }

  const canDeploy = useMemo(() => {
    try {
      JSON.parse(envVars);
      return !!repoUrl && !!branch;
    } catch {
      return false;
    }
  }, [repoUrl, branch, envVars]);

  async function deploy() {
    if (!canDeploy || !selectedProject) return;

    setDeploying(true);

    try {
      const res = await fetch(`${API_BASE}/api/deployProject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          projectName: selectedProject.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Deployment failed");

      const { data: dbDeployment } = await supabase
        .from("deployments")
        .insert({
          project_id: selectedProject.id,
          status: data.status || "building",
          logs: "Deployment started 🚀",
          deployment_id: data.deploymentId,
        })
        .select()
        .single();

      setDeployments((prev) => [dbDeployment, ...prev]);

      alert("Deployment started 🚀");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }

    setDeploying(false);
  }

  async function refreshDeploymentStatus(deployment) {
  if (!deployment.deployment_id) return;

  try {
    const res = await fetch(
      `${API_BASE}/api/deploymentStatus?deploymentId=${deployment.deployment_id}`
    );

    const data = await res.json();

    await supabase
      .from("deployments")
      .update({
        status: data.status === "READY" ? "success" : data.status,
        logs:
          data.status === "READY"
            ? "Deployment successful 🎉"
            : "Building...",
      })
      .eq("id", deployment.id);

    // 🔥 THIS IS THE IMPORTANT LINE
    loadDeployments();

  } catch (err) {
    console.error(err);
  }
}

  async function loadDeployments() {
    if (!selectedProject) return;

    const { data } = await supabase
      .from("deployments")
      .select("*")
      .eq("project_id", selectedProject.id)
      .order("created_at", { ascending: false });

    setDeployments(data || []);

    (data || []).forEach((d) => {
      if (d.status === "building") {
        refreshDeploymentStatus(d);
      }
    });
  }

  useEffect(() => {
    if (activeTab === "deploy" && selectedProject) {
      loadDeployments();
    }
  }, [activeTab, selectedProject]);

  if (loading) return <div style={{ padding: 40 }}>Loading projects…</div>;
  if (error) return <div style={{ padding: 40 }}>{error}</div>;

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <aside style={styles.sidebar}>
        <h3>Projects</h3>

        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => selectProject(p)}
            style={{
              ...styles.projectItem,
              background: selectedProject?.id === p.id ? "#6366f1" : "#fff",
              color: selectedProject?.id === p.id ? "#fff" : "#000",
            }}
          >
            {p.name}
          </div>
        ))}

        {canEdit && (
          <div style={{ marginTop: 12 }}>
            {creating ? (
              <>
                <input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={styles.input}
                />
                <button onClick={createProject} style={styles.primaryBtn}>
                  Create
                </button>
              </>
            ) : (
              <button
                onClick={() => setCreating(true)}
                style={styles.primaryBtn}
              >
                + New Project
              </button>
            )}
          </div>
        )}
      </aside>

      <main style={{ flex: 1 }}>
        {!selectedProject ? (
          <div>Select a project</div>
        ) : (
          <>
            <div style={styles.tabs}>
              <Tab
                label="Code"
                active={activeTab === "code"}
                onClick={() => setActiveTab("code")}
              />
              <Tab
                label="Deploy"
                active={activeTab === "deploy"}
                onClick={() => setActiveTab("deploy")}
              />
            </div>

            <section style={styles.card}>
              {activeTab === "code" && (
                <div style={styles.grid}>
                  <Field label="Repository URL" value={repoUrl} onChange={setRepoUrl}/>
                  <Field label="Branch" value={branch} onChange={setBranch}/>
                  <Field label="Environment Variables (JSON)" textarea value={envVars} onChange={setEnvVars}/>
                  <button onClick={saveCode} style={styles.primaryBtn}>Save settings</button>
                </div>
              )}

              {activeTab === "deploy" && (
                <>
                  <button disabled={!canDeploy || deploying} onClick={deploy} style={styles.primaryBtn}>
                    {deploying ? "Deploying..." : "Deploy 🚀"}
                  </button>

                  {deployments.map((d) => (
                    <div key={d.id} style={styles.deployRow}>
                      <strong>{d.status}</strong>
                      <span>{d.logs}</span>
                    </div>
                  ))}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span>{label}</span>
      {textarea ? (
        <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "6px 16px",
        borderRadius: 999,
        cursor: "pointer",
        background: active ? "#6366f1" : "#e5e7eb",
        color: active ? "#fff" : "#000",
      }}
    >
      {label}
    </div>
  );
}

const styles = {
  sidebar: {
    width: 260,
    background: "#f4f6fb",
    padding: 16,
    borderRadius: 12,
  },
  projectItem: {
    padding: 10,
    marginBottom: 6,
    borderRadius: 8,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 6,
  },
  primaryBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },
  card: {
    background: "#f4f6fb",
    padding: 24,
    borderRadius: 12,
  },
  grid: {
    display: "grid",
    gap: 16,
  },
  deployRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    background: "#fff",
    borderRadius: 8,
    marginTop: 8,
  },
};

