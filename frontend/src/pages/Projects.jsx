import { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";

const API_BASE = "https://devops-saas.vercel.app";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("code");

  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [envVars, setEnvVars] = useState("{}");

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
    setEnvVars(JSON.stringify(p.env_vars || {}, null, 2));
    setActiveTab("deploy");
  }

  // -------------------------
  // DEPLOY
  // -------------------------
  async function deploy() {
    if (!selectedProject) return;

    setDeploying(true);

    try {
      console.log("DEPLOYING:", repoUrl);

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

      const { data: dbDeployment } = await supabase
        .from("deployments")
        .insert({
          project_id: selectedProject.id,
          status: "building",
          logs: "Deployment started 🚀",
          deployment_id: data.deploymentId,
        })
        .select()
        .single();

      setDeployments((prev) => [dbDeployment, ...prev]);

    } catch (err) {
      alert(err.message);
      console.error(err);
    }

    setDeploying(false);
  }

  // -------------------------
  // STATUS CHECK (FIXED)
  // -------------------------
  async function refreshStatus(d) {
    if (!d.deployment_id) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/deploymentStatus?deploymentId=${d.deployment_id}`
      );

      const data = await res.json();

      console.log("STATUS:", data);

      let status = "building";
      let logs = "Building...";

      // ✅ SUCCESS
      if (data.status === "READY") {
        status = "success";
        logs = `Live: https://${data.url}`;
      }

      // ❌ FAIL
      else if (["ERROR", "CANCELED"].includes(data.status)) {
        status = "failed";
        logs = "Deployment failed ❌";
      }

      // 🔄 BUILDING STATES
      else {
        status = "building";
        logs = `Status: ${data.status}`;
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
  // LOAD DEPLOYMENTS
  // -------------------------
  async function loadDeployments() {
    if (!selectedProject) return;

    const { data } = await supabase
      .from("deployments")
      .select("*")
      .eq("project_id", selectedProject.id)
      .order("created_at", { ascending: false });

    setDeployments(data || []);
  }

  // -------------------------
  // POLLING (AUTO UPDATE)
  // -------------------------
  useEffect(() => {
    if (!selectedProject) return;

    loadDeployments();

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("deployments")
        .select("*")
        .eq("project_id", selectedProject.id);

      (data || []).forEach((d) => {
        if (d.status === "building") {
          refreshStatus(d);
        }
      });

      loadDeployments();
    }, 4000);

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
              borderRadius: 8,
            }}
          >
            {p.name}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1 }}>
        {!selectedProject ? (
          <div>Select project</div>
        ) : (
          <>
            <h2>{selectedProject.name}</h2>

            <div style={{ marginBottom: 20 }}>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Repo URL"
              />
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Branch"
              />

              <button onClick={deploy} disabled={deploying}>
                {deploying ? "Deploying..." : "Deploy 🚀"}
              </button>
            </div>

            {deployments.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: 10,
                  background: "#f4f6fb",
                  marginBottom: 10,
                  borderRadius: 8,
                }}
              >
                <strong>{d.status}</strong>
                <div>{d.logs}</div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}