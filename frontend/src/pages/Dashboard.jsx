import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const location = useLocation();
  const isPro = location.search.includes("success=true");

  const [team, setTeam] = useState([]);
  const [projects, setProjects] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [membersCount, setMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: tmList } = await supabase
      .from("team_members")
      .select("*")
      .eq("user_id", user.id);

    if (!tmList || tmList.length === 0) {
      setLoading(false);
      return;
    }

    const teamIds = tmList.map((t) => t.team_id);

    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .in("id", teamIds);

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .in("team_id", teamIds)
      .order("created_at", { ascending: false });

    const { data: membersData } = await supabase
      .from("team_members")
      .select("id")
      .in("team_id", teamIds);

    setTeam(teamsData || []);
    setProjects(projectsData || []);
    setMembersCount(membersData?.length || 0);

    if (projectsData?.length) {
      const projectIds = projectsData.map((p) => p.id);

      const { data: deployData } = await supabase
        .from("deployments")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(5);

      setDeployments(deployData || []);
    }

    setLoading(false);
  };

  // ✅ FIXED endpoint name here
  const handleCheckout = async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>
        Welcome back 👋
        {isPro && (
          <span style={{ marginLeft: 10, background: "gold", padding: 5 }}>
            PRO
          </span>
        )}
      </h1>

      {/* ✅ FIXED MULTI TEAM */}
      <div>
        Team: <b>{team.map((t) => t.name).join(", ") || "—"}</b>
      </div>

      <p>
        DeployAlly lets you manage deployments, monitor projects, and collaborate.
      </p>

      {!isPro && (
        <button onClick={handleCheckout}>
          🚀 Upgrade to Pro
        </button>
      )}

      {isPro && <div>🔥 You are now PRO!</div>}

      <h3>Projects: {projects.length}</h3>
      <h3>Deployments: {deployments.length}</h3>
      <h3>Members: {membersCount}</h3>
    </div>
  );
}