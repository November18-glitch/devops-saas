import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ IMPORTANT
import "./Teams.css";

export default function Teams() {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [user, setUser] = useState(null);

  // 🔥 LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  // 🚀 LOAD TEAMS (WITH TOKEN)
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
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to fetch teams", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // 🚀 CREATE TEAM
  const handleCreateTeam = async () => {
    if (!teamName) return alert("Enter a team name");
    if (!user) return alert("User not loaded");

    setCreating(true);

    try {
      const { data: session } = await supabase.auth.getSession();

      const res = await fetch("/api/createTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          name: teamName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setTeams((prev) => [data.team, ...prev]);
      setTeamName("");
    } catch (err) {
      console.error(err);
      alert("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenTeam = (teamId) => {
    navigate(`/projects?teamId=${teamId}`);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Delete this team?")) return;

    try {
      const { data: session } = await supabase.auth.getSession();

      const res = await fetch("/api/deleteTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ teamId }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.error);

      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete team");
    }
  };

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>👥 Teams</h1>
        <p className="subtitle">
          Manage your teams and collaborate on projects
        </p>
      </div>

      <div className="teams-card">
        <h3>Create Team</h3>

        <div className="row">
          <input
            placeholder="Awesome Startup Team"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          <button onClick={handleCreateTeam} disabled={creating}>
            {creating ? "Creating..." : "➕ Create"}
          </button>
        </div>
      </div>

      <div className="teams-section">
        <h3>Your Teams</h3>

        {loading ? (
          <p className="muted">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="muted">No teams yet 🚀</p>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => (
              <div key={team.id} className="team-card">
                <div className="team-top">
                  <h4>{team.name}</h4>
                  <span className="badge">TEAM</span>
                </div>

                <p className="team-id">
                  {team.id.slice(0, 8)}...{team.id.slice(-4)}
                </p>

                <div className="team-actions">
                  <button
                    className="secondary"
                    onClick={() => handleOpenTeam(team.id)}
                  >
                    Open
                  </button>

                  <button
                    className="danger"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}