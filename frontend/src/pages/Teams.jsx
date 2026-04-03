import { useState } from "react";

export default function Teams() {
const [teamName, setTeamName] = useState("");

const handleCreateTeam = async () => {
try {
const res = await fetch("/api/createTeam", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
  name: teamName,
  userId: "user",
  email: "test@example.com"
}),
});


  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Team created 🚀");

} catch (err) {
  console.error(err);
  alert("Failed to create team");
}

};

return (
<div style={{ padding: "20px" }}> <h2>👥 Teams</h2>

```
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

);
}
