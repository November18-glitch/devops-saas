import { useState, useEffect } from "react";

export default function Teams() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD TEAMS FROM DB
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

  // 🚀 CREATE TEAM (YOUR EXISTING LOGIC + UI UPDATE)
  const handleCreateTeam = async () => {
    try {
      const res = await fetch("/api/createTeam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          userId: "11111111-1111-1111-1111-111111111111", // keep your current setup
          email: "test@example.com",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // ✅ ADD NEW TEAM TO UI INSTANTLY
      setTeams((prev) => [data.team, ...prev]);

      setTeamName("");

    } catch (err) {
      console.error(err);
      alert("Failed to create team");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>👥 Teams</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <button onClick={handleCreateTeam}>
          Create Team
        </button>
      </div>

      <h3>Your Teams</h3>

      {loading ? (
        <p>Loading...</p>
      ) : teams.length === 0 ? (
        <p>No teams yet</p>
      ) : (
        <div>
          {teams.map((team) => (
            <div
              key={team.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              <p><strong>{team.name}</strong></p>
              <p>ID: {team.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}