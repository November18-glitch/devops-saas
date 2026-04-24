import { useState, useEffect } from "react";
import "./Teams.css";

export default function Teams() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 🚀 LOAD TEAMS
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/getTeams");
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

    setCreating(true);

    try {
      const res = await fetch("/api/createTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          userId: "11111111-1111-1111-1111-111111111111",
          email: "test@example.com",
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

  return (
    <div className="teams-container">
      
      {/* HEADER */}
      <div className="teams-header">
        <h1>👥 Teams</h1>
        <p className="subtitle">
          Manage your teams and collaborate on projects
        </p>
      </div>

      {/* CREATE CARD */}
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

      {/* LIST */}
      <div className="teams-section">
        <h3>Your Teams</h3>

        {loading ? (
          <p className="muted">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="muted">No teams yet. Create your first one 🚀</p>
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
                  <button className="secondary">Open</button>
                  <button className="danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}