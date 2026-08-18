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

  const [user, setUser] = useState(null);

  const [inviting, setInviting] = useState(false);

  /*
  =========================
  LOAD USER
  =========================
  */

  useEffect(() => {
    const loadUser = async () => {
      const {
        data,
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "[TEAMS] USER ERROR:",
          error
        );
        return;
      }

      setUser(data.user);
    };

    loadUser();
  }, []);

  /*
  =========================
  LOAD TEAMS
  =========================
  */

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);

      let session =
        (
          await supabase.auth.getSession()
        ).data.session;

      /*
      Wait for Supabase session if necessary.
      */

      if (!session) {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          session =
            (
              await supabase.auth.getSession()
            ).data.session;

          if (session) {
            break;
          }
        }
      }

      if (!session) {
        console.error(
          "[TEAMS] No Supabase session"
        );

        setTeams([]);
        return;
      }

      const response = await fetch(
        "/api/app?action=getTeams",
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data =
        await response.json();

      console.log(
        "[TEAMS] API RESPONSE:",
        data
      );

      if (!response.ok) {
        console.error(
          "[TEAMS] API ERROR:",
          data
        );

        setTeams([]);
        return;
      }

      setTeams(
        data.teams || []
      );

    } catch (error) {
      console.error(
        "[TEAMS] FETCH ERROR:",
        error
      );

      setTeams([]);

    } finally {
      setLoading(false);
    }
  };

  /*
  =========================
  CREATE TEAM
  =========================
  */

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert(
        "Please enter a team name."
      );
      return;
    }

    if (!user) {
      alert(
        "User is still loading."
      );
      return;
    }

    setCreating(true);

    try {
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const session =
        sessionData?.session;

      if (!session) {
        alert(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const response =
        await fetch(
          "/api/createTeam",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              name: teamName.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
          "Failed to create team."
        );
        return;
      }

      /*
      Refresh from backend instead of
      manually constructing the team.
      */

      await fetchTeams();

      setTeamName("");

    } catch (error) {
      console.error(
        "[TEAMS] CREATE ERROR:",
        error
      );

      alert(
        "Failed to create team."
      );

    } finally {
      setCreating(false);
    }
  };

  /*
  =========================
  INVITE MEMBER
  =========================
  */

  const handleInvite = async (
    team
  ) => {
    if (!inviteEmail.trim()) {
      alert(
        "Enter an email address."
      );
      return;
    }

    /*
    Do not allow more than 3
    verified members on FREE.
    */

    if (
      (team.membersCount || 0) >= 3
    ) {
      alert(
        "This team already has 3 verified members."
      );
      return;
    }

    setInviting(true);

    try {
      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      const session =
        sessionData?.session;

      if (!session) {
        alert(
          "Your session has expired."
        );
        return;
      }

      const response =
        await fetch(
          "/api/inviteMember",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              teamId: team.id,
              email:
                inviteEmail.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
          "Failed to send invitation."
        );
        return;
      }

      alert(
        "Invitation sent successfully!"
      );

      setInviteEmail("");
      setSelectedTeam(null);

      /*
      Refresh team information.
      */

      await fetchTeams();

    } catch (error) {
      console.error(
        "[TEAMS] INVITE ERROR:",
        error
      );

      alert(
        "Failed to send invitation."
      );

    } finally {
      setInviting(false);
    }
  };

  /*
  =========================
  OPEN TEAM
  =========================
  */

  const handleOpenTeam = (
    teamId
  ) => {
    navigate(
      `/projects?teamId=${teamId}`
    );
  };

  /*
  =========================
  LOADING
  =========================
  */

  if (loading) {
    return (
      <div className="teams-container">
        <div className="teams-loading">
          Loading your teams...
        </div>
      </div>
    );
  }

  /*
  =========================
  PAGE
  =========================
  */

  return (
    <div className="teams-container">

      {/* HEADER */}

      <div className="teams-header">

        <h1>
          👥 Teams
        </h1>

        <p className="subtitle">
          Manage workspaces,
          members, invitations,
          and collaboration.
        </p>

      </div>

      {/* CREATE TEAM */}

      <div className="teams-card">

        <div className="section-heading">
          <div>
            <h3>
              Create Team
            </h3>

            <p className="muted">
              Start a new workspace
              for your projects.
            </p>
          </div>
        </div>

        <div className="row">

          <input
            placeholder="Awesome Startup Team"
            value={teamName}
            onChange={(e) =>
              setTeamName(
                e.target.value
              )
            }
          />

          <button
            onClick={
              handleCreateTeam
            }
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

        <div className="teams-section-header">

          <div>
            <h3>
              Your Teams
            </h3>

            <p className="muted">
              {teams.length} workspace
              {teams.length === 1
                ? ""
                : "s"}
            </p>
          </div>

        </div>

        {teams.length === 0 ? (

          <div className="empty-team-state">

            <div className="empty-team-icon">
              👥
            </div>

            <h3>
              No teams yet
            </h3>

            <p>
              Create your first workspace
              to start deploying projects
              with your team.
            </p>

          </div>

        ) : (

          <div className="teams-grid">

            {teams.map((team) => {

              const memberCount =
                team.membersCount || 0;

              const isFull =
                memberCount >= 3;

              const isOwner =
                team.owner_id ===
                user?.id;

              return (
                <div
                  key={team.id}
                  className="team-card"
                >

                  {/* TEAM HEADER */}

                  <div className="team-top">

                    <div>

                      <h4>
                        {team.name}
                      </h4>

                      <p className="team-id">
                        {team.id.slice(
                          0,
                          8
                        )}
                        ...
                        {team.id.slice(
                          -4
                        )}
                      </p>

                    </div>

                    <span className="badge">
                      TEAM
                    </span>

                  </div>

                  {/* MEMBER COUNT */}

                  <div className="member-limit">

                    <div className="member-limit-top">

                      <span>
                        Verified members
                      </span>

                      <strong>
                        {memberCount} / 3
                      </strong>

                    </div>

                    <div className="member-progress">

                      <div
                        className="member-progress-fill"
                        style={{
                          width:
                            `${Math.min(
                              memberCount / 3,
                              1
                            ) * 100}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* MEMBERS */}

                  <div className="team-members-list">

                    {(team.members || [])
                      .map(
                        (member) => (

                          <div
                            key={
                              member.id
                            }
                            className="team-member-row"
                          >

                            <div>

                              <div className="member-email">
                                {member.email ||
                                  "Unknown member"}
                              </div>

                              <div className="member-role">
                                {member.role ===
                                "owner"
                                  ? "Owner"
                                  : "Member"}
                              </div>

                            </div>

                            <span className="member-status">
                              ✓ Verified
                            </span>

                          </div>

                        )
                      )}

                  </div>

                  {/* ACTIONS */}

                  <div className="team-actions">

                    <button
                      className="secondary"
                      onClick={() =>
                        handleOpenTeam(
                          team.id
                        )
                      }
                    >
                      Open
                    </button>

                    {isOwner && (
                      <button
                        className="secondary"
                        onClick={() =>
                          setSelectedTeam(
                            selectedTeam ===
                            team.id
                              ? null
                              : team.id
                          )
                        }
                      >
                        {selectedTeam ===
                        team.id
                          ? "Cancel"
                          : "Invite"}
                      </button>
                    )}

                  </div>

                  {/* INVITE */}

                  {selectedTeam ===
                    team.id &&
                    isOwner && (

                    <div className="invite-box">

                      {isFull ? (

                        <div className="invite-limit-message">
                          🔒 Team is full.
                          Free teams can have
                          up to 3 verified
                          members.
                        </div>

                      ) : (

                        <>
                          <input
                            type="email"
                            placeholder="member@email.com"
                            value={
                              inviteEmail
                            }
                            onChange={(e) =>
                              setInviteEmail(
                                e.target.value
                              )
                            }
                          />

                          <button
                            onClick={() =>
                              handleInvite(
                                team
                              )
                            }
                            disabled={
                              inviting
                            }
                          >
                            {inviting
                              ? "Sending..."
                              : "Send Invite"}
                          </button>
                        </>

                      )}

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}