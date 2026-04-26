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

    // 🔥 FIX STARTS HERE
    if (projectsData && projectsData.length > 0) {
      const projectIds = projectsData.map((p) => p.id).filter(Boolean);

      if (projectIds.length > 0) {
        const { data: deployData } = await supabase
          .from("deployments")
          .select("*")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(5);

        setDeployments(deployData || []);
      } else {
        setDeployments([]);
      }
    } else {
      setDeployments([]);
    }
    // 🔥 FIX ENDS HERE

    setLoading(false);
  };

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
    <div style={{ padding: 40, fontFamily: "Inter, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      <div style={main}>
        
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            Welcome back 👋
            {isPro && <span style={proBadge}>PRO</span>}
          </h1>

          <div style={{ color: "#64748b", marginBottom: 10 }}>
            Teams: <b>{team.map((t) => t.name).join(", ") || "—"}</b>
          </div>

          <p style={{ maxWidth: 600, color: "#475569" }}>
            Manage deployments, monitor your infrastructure, and collaborate with your team — all in one place.
          </p>

          {!isPro && (
            <button onClick={handleCheckout} style={upgradeBtn}>
              🚀 Upgrade to Pro — Unlock Unlimited Deployments
            </button>
          )}

          {isPro && (
            <div style={successBox}>
              🔥 You are now PRO — unlimited deployments unlocked
            </div>
          )}
        </div>

        <div style={grid}>
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Deployments" value={deployments.length} />
          <StatCard label="Team Members" value={membersCount} />
        </div>
      </div>
    </div>
  );
}

/* styles unchanged */