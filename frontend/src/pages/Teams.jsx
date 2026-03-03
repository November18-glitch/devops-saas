import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Teams.css";

export default function Teams() {

  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("team_members")
      .select("team_id, teams(id,name)")
      .eq("user_id", user.id);

    const formatted = (data || []).map(t => ({
      id: t.teams.id,
      name: t.teams.name
    }));

    setTeams(formatted);

    if (formatted.length) {
      setActiveTeamId(formatted[0].id);
      await loadMembers(formatted[0].id);
      await loadInvites(formatted[0].id);
    }

    setLoading(false);
  }

  async function loadMembers(teamId) {
    const { data } = await supabase
      .from("team_members")
      .select("id,role,profiles(email)")
      .eq("team_id", teamId);

    setMembers(data || []);
  }

  async function loadInvites(teamId) {
    const { data } = await supabase
      .from("team_invites")
      .select("*")
      .eq("team_id", teamId)
      .eq("accepted", false);

    setInvites(data || []);
  }

  async function createTeam() {
    if (!teamName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { data: team } = await supabase
      .from("teams")
      .insert({ name: teamName.trim(), owner_id: user.id })
      .select()
      .single();

    await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "owner"
    });

    setTeamName("");
    load();
  }

  async function invite() {
    setError("");

    if (!email || !activeTeamId) return;

    try {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("You must be logged in");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "send-team-invite",
        {
          body: {
            email: email.trim().toLowerCase(),
            team_id: activeTeamId,
            role: "member"
          }
        }
      );

      if (error) {
        console.log("FUNCTION ERROR:", error);
        setError(error.message);
        return;
      }

      console.log("SUCCESS:", data);

      setEmail("");
      loadInvites(activeTeamId);

    } catch (err) {
      console.error("CATCH ERROR:", err);
      setError(err.message);
    }
  }

  async function deleteInvite(id) {
    await supabase.from("team_invites").delete().eq("id", id);
    loadInvites(activeTeamId);
  }

  if (loading) return <div className="teams-loading">Loading teams...</div>;

  return (
    <div className="teams-container">

      <h1 className="teams-title">Teams</h1>

      <div className="teams-card">
        <h3>Create Team</h3>
        <div className="row">
          <input
            placeholder="Team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
          <button
            onClick={createTeam}
            disabled={!teamName.trim()}
          >
            Create
          </button>
        </div>
      </div>

      <div className="teams-card">
        <h3>Your Teams</h3>

        <div className="team-list">
          {teams.map(t => (
            <button
              key={t.id}
              className={t.id === activeTeamId ? "active" : ""}
              onClick={()=>{
                setActiveTeamId(t.id);
                loadMembers(t.id);
                loadInvites(t.id);
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {activeTeamId && (
        <div className="teams-card">
          <h3>Members</h3>

          {members.length === 0 && <p className="muted">No members yet</p>}

          {members.map(m => (
            <div key={m.id} className="list-item">
              <span>{m.profiles?.email}</span>
              <span className="role">{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {activeTeamId && (
        <div className="teams-card">
          <h3>Pending Invites</h3>

          {invites.length === 0 && <p className="muted">No invites</p>}

          {invites.map(i => (
            <div key={i.id} className="list-item">
              <span>{i.email}</span>
              <button
                className="danger"
                onClick={()=>deleteInvite(i.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTeamId && (
        <div className="teams-card">
          <h3>Invite User</h3>

          <div className="row">
            <input
              placeholder="email address"
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
            <button
              onClick={invite}
              disabled={!email}
            >
              Send Invite
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </div>
      )}

    </div>
  );
}