import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Teams.css";

export default function Teams() {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [inviting, setInviting] = useState(false);

  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("FREE");

  const [teamMembers, setTeamMembers] = useState({});
  const [removingMember, setRemovingMember] = useState(null);

  /*
  =========================
  LOAD USER
  =========================
  */

  useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();

    setUser(data.user);

    if (!data.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", data.user.id)
      .single();

    setPlan(profile?.plan || "FREE");
  };

  loadUser();
}, []);

  /*
  =========================
  GET TEAM MEMBERS
  =========================
  */

  const fetchTeamMembers = async (teamId) => {
    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const session = sessionData?.session;

      if (!session) return;

      const res = await fetch(
        `/api/app?action=getTeamMembers&teamId=${teamId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "[TEAMS] Failed to load members:",
          data
        );
        return;
      }

      setTeamMembers((prev) => ({
        ...prev,
        [teamId]: data.members || [],
      }));
    } catch (err) {
      console.error(
        "[TEAMS] Member loading failed:",
        err
      );
    }
  };

  /*
  =========================
  LOAD TEAMS
  =========================
  */

  const fetchTeams = async () => {
    try {
      setLoading(true);

      let session =
        (await supabase.auth.getSession()).data.session;

      if (!session) {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          session =
            (await supabase.auth.getSession()).data.session;

          if (session) break;
        }
      }

      if (!session) {
        console.error(
          "[TEAMS] No Supabase session."
        );
        return;
      }

      const res = await fetch(
        "/api/app?action=getTeams",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "[TEAMS] Failed to load teams:",
          data
        );
        return;
      }

      const loadedTeams = data.teams || [];

      setTeams(loadedTeams);

      /*
      Load members for every team.
      */
      for (const team of loadedTeams) {
        await fetchTeamMembers(team.id);
      }
    } catch (err) {
      console.error(
        "[TEAMS] Failed to fetch teams:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  /*
  =========================
  CREATE TEAM
  =========================
  */

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert("Enter a team name.");
      return;
    }

    if (!user) {
      alert("User not loaded.");
      return;
    }

    setCreating(true);

    try {
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const token =
        sessionData?.session?.access_token;

      if (!token) {
        alert("Your session has expired.");
        return;
      }

      const res = await fetch(
        "/api/createTeam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: teamName.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
          "Failed to create team."
        );
        return;
      }

      setTeamName("");

      await fetchTeams();
    } catch (err) {
      console.error(
        "[TEAMS] Create team error:",
        err
      );

      alert("Failed to create team.");
    } finally {
      setCreating(false);
    }
  };

  /*
  =========================
  INVITE MEMBER
  =========================
  */

  const handleInvite = async (team) => {
    if (!inviteEmail.trim()) {
      alert("Enter an email address.");
      return;
    }

    if (!team) {
      return;
    }

    if (!team.is_owner) {
      alert(
        "Only the team owner can invite members."
      );
      return;
    }

    if (
  plan !== "PRO" &&
  (team.member_count || 0) >=
    (team.max_members || 3)
) {
  alert("This team is already full.");
  return;
}

    setInviting(true);

    try {
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const token =
        sessionData?.session?.access_token;

      if (!token) {
        alert("Your session has expired.");
        return;
      }

      const res = await fetch(
        "/api/inviteMember",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamId: team.id,
            email: inviteEmail.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
          "Failed to send invitation."
        );
        return;
      }

      alert("Invitation sent!");

      setInviteEmail("");
      setSelectedTeam(null);

      await fetchTeams();
    } catch (err) {
      console.error(
        "[TEAMS] Invite error:",
        err
      );

      alert("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  /*
  =========================
  REMOVE MEMBER
  =========================
  */

  const handleRemoveMember = async (
    teamId,
    memberId
  ) => {
    const confirmed = window.confirm(
      "Remove this member from the team?"
    );

    if (!confirmed) return;

    setRemovingMember(memberId);

    try {
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const token =
        sessionData?.session?.access_token;

      if (!token) {
        alert("Your session has expired.");
        return;
      }

      const res = await fetch(
        "/api/app?action=removeMember",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamId,
            memberId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.error ||
          "Failed to remove member."
        );
        return;
      }

      /*
      Remove member immediately from UI.
      */

      setTeamMembers((prev) => ({
        ...prev,
        [teamId]: (prev[teamId] || []).filter(
          (member) => member.id !== memberId
        ),
      }));

      /*
      Update team count immediately.
      */

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? {
                ...team,
                member_count: Math.max(
                  0,
                  (team.member_count || 0) - 1
                ),
              }
            : team
        )
      );
    } catch (err) {
      console.error(
        "[TEAMS] Remove member failed:",
        err
      );

      alert("Failed to remove member.");
    } finally {
      setRemovingMember(null);
    }
  };

  /*
  =========================
  OPEN TEAM
  =========================
  */

  const handleOpenTeam = (teamId) => {
    navigate(`/projects?teamId=${teamId}`);
  };

  /*
  =========================
  LOADING
  =========================
  */

  if (loading) {
    return (
      <div className="teams-container">
        <div className="teams-header">
          <h1>👥 Teams</h1>

          <p className="subtitle">
            Loading your workspaces...
          </p>
        </div>
      </div>
    );
  }

  /*
  =========================
  UI
  =========================
  */

  return (
    <div className="teams-container">

      <div className="teams-header">
        <h1>👥 Teams</h1>

        <p className="subtitle">
          Manage your teams and collaborate
          on projects.
        </p>
      </div>

      {/* CREATE TEAM */}

      <div className="teams-card">
        <h3>Create Team</h3>

        <div className="row">
          <input
            placeholder="Awesome Startup Team"
            value={teamName}
            onChange={(e) =>
              setTeamName(e.target.value)
            }
          />

          <button
            onClick={handleCreateTeam}
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "➕ Create"}
          </button>
        </div>
      </div>

      {/* TEAM LIST */}

      <div className="teams-section">

        <h3>Your Teams</h3>

        {teams.length === 0 ? (
          <p className="muted">
            No teams yet 🚀
          </p>
        ) : (

          <div className="teams-grid">

             {teams.map((team) => {

              const members =
               teamMembers[team.id] || [];

              const memberCount =
               team.member_count || 0;

              const maxMembers =
               team.max_members || 3;

              const slotsLeft =
               plan === "PRO"
               ? Infinity
               : Math.max(
               0,
               maxMembers - memberCount
              );

              const isFull =
               plan !== "PRO" &&
               memberCount >= maxMembers;

              return (
               <div
                key={team.id}
                className="team-card"
              >

                  {/* TEAM HEADER */}

                  <div className="team-top">

                    <h4>
                      {team.name}
                    </h4>

                    <span className="badge">
                      TEAM
                    </span>

                  </div>

                  <p className="team-id">
                    {team.id.slice(0, 8)}
                    ...
                    {team.id.slice(-4)}
                  </p>

                  {/* MEMBER COUNT */}

                  <div className="member-summary">

                    <div className="member-count">
                      👥

                      <strong>
  {plan === "PRO"
    ? `${memberCount} members`
    : `${memberCount}/${maxMembers}`}
</strong>

<span>
  {plan === "PRO"
    ? "unlimited team"
    : "active members"}
</span>

                    {plan === "PRO" ? (
  <span className="available-badge">
    Unlimited
  </span>
) : isFull ? (
  <span className="full-badge">
    Team full
  </span>
) : (
  <span className="available-badge">
    {slotsLeft}{" "}
    {slotsLeft === 1
      ? "slot"
      : "slots"}{" "}
    available
  </span>
)}

                  </div>

                  </div>

                  {/* OWNER STATUS */}

                  <div className="role-summary">

                    {team.is_owner ? (
                      <span className="owner-badge">
                        👑 You are the owner
                      </span>
                    ) : (
                      <span className="member-badge">
                        👤 Team member
                      </span>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="team-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        handleOpenTeam(team.id)
                      }
                    >
                      Open
                    </button>

                    {team.is_owner && (
                      <button
  className="secondary"
  disabled={isFull}
  onClick={() =>
    setSelectedTeam(
      selectedTeam === team.id
        ? null
        : team.id
    )
  }
>
  {isFull
    ? "Full"
    : "Invite"}
</button>
                    )}

                  </div>

                  {/* INVITE BOX */}

                  {team.is_owner &&
                    selectedTeam === team.id && (
                      <div
                        className="invite-box"
                        style={{
                          marginTop: "14px",
                          display: "flex",
                          gap: "10px",
                        }}
                      >

                        <input
                          style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "10px",
                            border:
                              "1px solid #e2e8f0",
                          }}
                          placeholder="member@email.com"
                          value={inviteEmail}
                          onChange={(e) =>
                            setInviteEmail(
                              e.target.value
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            handleInvite(team)
                          }
                          disabled={inviting}
                        >
                          {inviting
                            ? "Sending..."
                            : "Send Invite"}
                        </button>

                      </div>
                    )}

                  {/* MEMBERS */}

                  <div className="member-management">

                    <div className="member-management-title">
                      Team members
                    </div>

                    {members.length === 0 ? (
                      <p className="member-management-help">
                        No active members found.
                      </p>
                    ) : (
                      <div className="team-members-list">

                        {members.map((member) => (

                          <div
                            key={member.id}
                            className="team-member-row"
                          >

                            <div>
                              <div className="member-email">
                                {member.email ||
                                  "Unknown email"}
                              </div>

                              <div className="member-role">
                                {member.role}
                              </div>
                            </div>

                            {team.is_owner &&
                              member.role !==
                                "owner" && (
                                <button
                                  className="danger"
                                  disabled={
                                    removingMember ===
                                    member.id
                                  }
                                  onClick={() =>
                                    handleRemoveMember(
                                      team.id,
                                      member.id
                                    )
                                  }
                                >
                                  {removingMember ===
                                  member.id
                                    ? "Removing..."
                                    : "Remove"}
                                </button>
                              )}

                          </div>

                        ))}

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}