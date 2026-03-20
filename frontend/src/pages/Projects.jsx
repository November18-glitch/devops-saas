import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";

const API_BASE = "https://devops-saas.vercel.app";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("deploy");

  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");

  const [deployments, setDeployments] = useState([]);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase.from("projects").select("*");
    setProjects(data || []);
  }

  function selectProject(p) {
    setSelectedProject(p);
    setRepoUrl(p.repo_url || "");
    setBranch(p.default_branch || "main");
  }

  const canDeploy = useMemo(() => {
    return !!repoUrl && !!branch;
  }, [repoUrl, branch]);

  // -------------------------
  // DEPLOY
  // -------------------------
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
          branch,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deploy failed");
      }

      const { deploymentId } = data;

      const { data: dbDeployment } = await supabase
        .from("deployments")
        .insert({
          project_id: selectedProject.id,
          status: "building",
          logs: "Deployment started 🚀",
          deployment_id: deploymentId,
        })
        .select()
        .single();

      setDeployments((prev) => [dbDeployment, ...prev]);

    } catch (err) {
      console.error(err);
      alert(err.message);
    }

    setDeploying(false);
  }

  // -------------------------
  // LOAD + UPDATE STATUS
  // -------------------------
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
        refreshStatus(d);
      }
    });
  }

  async function refreshStatus(d) {
    try {
      const res = await fetch(
        `${API_BASE}/api/deploymentStatus?deploymentId=${d.deployment_id}`
      );

      const data = await res.json();

      let status = "building";
      let logs = "Building...";

      if (data.status === "READY") {
        status = "success";
        logs = `Live: https://${data.url}`;
      }

      if (data.status === "ERROR") {
        status = "failed";
        logs = "Deployment failed ❌";
      }

      await supabase
        .from("deployments")
        .update({ status, logs })
        .eq("id", d.id);

    } catch (err) {
      console.error(err);
    }
  }

  // -------------------------
  // AUTO REFRESH (REAL SaaS)
  // -------------------------
  useEffect(() => {
    if (!selectedProject) return;

    loadDeployments();

    const interval = setInterval(() => {
      loadDeployments();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedProject]);

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <aside style={{ width: 250 }}>
        <h3>Projects</h3>

        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => selectProject(p)}
            style={{
              padding: 10,
              cursor: "pointer",
              background:
                selectedProject?.id === p.id ? "#6366f1" : "#eee",
              color:
                selectedProject?.id === p.id ? "#fff" : "#000",
              marginBottom: 6,
            }}
          >
            {p.name}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1 }}>
        {!selectedProject ? (
          <p>Select project</p>
        ) : (
          <>
            <h2>{selectedProject.name}</h2>

            <input
              placeholder="Repo URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />

            <input
              placeholder="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />

            <button onClick={deploy} disabled={deploying}>
              {deploying ? "Deploying..." : "Deploy 🚀"}
            </button>

            <hr />

            {deployments.map((d) => (
              <div key={d.id}>
                <strong>{d.status}</strong> — {d.logs}
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}