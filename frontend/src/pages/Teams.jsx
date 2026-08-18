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

  const [removingMember, setRemovingMember] =
    useState(null);

  /*
  =========================
  LOAD USER
  =========================
  */

  useEffect(() => {
    const loadUser = async () => {
      const {
        data,
      } =
        await supabase.auth.getUser();

      setUser(data.user);
    };

    loadUser();
  }, []);

  /*
  =========================
  LOAD TEAMS
  =========================
  */

  const fetchTeams = async () => {
    try {
      setLoading(true);

      let session =
        (
          await supabase.auth.getSession()
        ).data.session;

      /*
      Wait briefly if Supabase
      is still restoring session.
      */

      if (!session) {
        for (
          let i = 0;
          i < 10;
          i++
        ) {
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                500
              )
          );

          session =
            (
              await supabase.auth.getSession()
            ).data.session;

          if (session) break;
        }
      }

      if (!session) {
        console.error(
          "No Supabase session."
        );

        setTeams([]);
        return;
      }

      const res =
        await fetch(
          "/api/app?action=getTeams",
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        console.error(
          "GET TEAMS ERROR:",
          data
        );

        setTeams([]);
        return;
      }

      console.log(
        "[TEAMS] LOADED:",
        data.teams
      );

      setTeams(
        data.teams || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch teams",
        err
      );

      setTeams([]);
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

  const handleCreateTeam =
    async () => {
      if (!teamName.trim()) {
        alert(
          "Enter a team name"
        );
        return;
      }

      if (!user) {
        alert(
          "User not loaded"
        );
        return;
      }

      setCreating(true);

      try {
        const {
          data: session,
        } =
          await supabase.auth.getSession();

        const res =
          await fetch(
            "/api/createTeam",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.session?.access_token}`,
              },

              body: JSON.stringify({
                name:
                  teamName.trim(),
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
              "Failed to create team"
          );
          return;
        }

        setTeams((prev) => [
          data.team,
          ...prev,
        ]);

        setTeamName("");

        /*
        Reload so the new team
        immediately contains
        member_count = 1.
        */

        await fetchTeams();
      } catch (err) {
        console.error(
          err
        );

        alert(
          "Failed to create team"
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

  const handleInvite =
    async (team) => {
      if (
        !inviteEmail.trim() ||
        !team
      ) {
        return;
      }

      /*
      Client-side convenience check.
      The server remains the real authority.
      */

      if (
        team.member_count >=
        team.max_members
      ) {
        alert(
          "This team is full."
        );
        return;
      }

      try {
        const {
          data: session,
        } =
          await supabase.auth.getSession();

        if (!session.session) {
          alert(
            "Your session expired. Please log in again."
          );
          return;
        }

        const res =
          await fetch(
            "/api/inviteMember",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.session.access_token}`,
              },

              body: JSON.stringify({
                teamId:
                  team.id,

                email:
                  inviteEmail.trim(),
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
              "Failed to send invitation."
          );
          return;
        }

        alert(
          "Invitation sent!"
        );

        setInviteEmail("");
        setSelectedTeam(null);
      } catch (err) {
        console.error(
          "[INVITE ERROR]",
          err
        );

        alert(
          "Failed to send invitation."
        );
      }
    };

  /*
  =========================
  REMOVE MEMBER
  =========================
  */

  const handleRemoveMember =
    async (
      teamId,
      memberId
    ) => {
      const confirmed =
        window.confirm(
          "Remove this member from the team?"
        );

      if (!confirmed) {
        return;
      }

      setRemovingMember(
        memberId
      );

      try {
        const {
          data: session,
        } =
          await supabase.auth.getSession();

        if (!session.session) {
          alert(
            "Your session expired. Please log in again."
          );
          return;
        }

        const res =
          await fetch(
            "/api/app?action=removeMember",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.session.access_token}`,
              },

              body: JSON.stringify({
                teamId,
                memberId,
              }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
              "Failed to remove member."
          );
          return;
        }

        /*
        Reload team data so
        member_count updates.
        */

        await fetchTeams();

      } catch (err) {
        console.error(
          "[REMOVE MEMBER ERROR]",
          err
        );

        alert(
          "Failed to remove member."
        );
      } finally {
        setRemovingMember(null);
      }
    };

  /*
  =========================
  OPEN PROJECTS
  =========================
  */

  const handleOpenTeam =
    (teamId) => {
      navigate(
        `/projects?teamId=${teamId}`
      );
    };

  /*
  =========================
  RENDER
  =========================
  */

  return (
    <div className="teams-container">

      <div className="teams-header">
        <h1>👥 Teams</h1>

        <p className="subtitle">
          Manage your teams and collaborate
          on projects
        </p>
      </div>

      {/* CREATE TEAM */}

      <div className="teams-card">
        <h3>
          Create Team
        </h3>

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

      {/* YOUR TEAMS */}

      <div className="teams-section">

        <h3>
          Your Teams
        </h3>

        {loading ? (

          <p className="muted">
            Loading teams...
          </p>

        ) : teams.length === 0 ? (

          <p className="muted">
            No teams yet 🚀
          </p>

        ) : (

          <div className="teams-grid">

            {teams.map(
              (team) => {

                const memberCount =
                  team.member_count ||
                  0;

                const maxMembers =
                  team.max_members ||
                  3;

                const isFull =
                  memberCount >=
                  maxMembers;

                const isOwner =
                  team.is_owner;

                return (

                  <div
                    key={team.id}
                    className="team-card"
                  >

                    {/* HEADER */}

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

                    {/* MEMBERS */}

                    <div className="team-members-summary">

                      <div className="member-count">

                        <span className="member-icon">
                          👥
                        </span>

                        <strong>
                          {memberCount}
                        </strong>

                        <span>
                          /
                          {maxMembers}
                        </span>

                        <span>
                          active members
                        </span>

                      </div>

                      <div
                        className={
                          isFull
                            ? "capacity-full"
                            : "capacity-available"
                        }
                      >
                        {isFull
                          ? "Team full"
                          : `${maxMembers - memberCount} seat${
                              maxMembers -
                                memberCount ===
                              1
                                ? ""
                                : "s"
                            } available`}
                      </div>

                    </div>

                    {/* OWNER STATUS */}

                    <div className="team-role">

                      {isOwner
                        ? "👑 You are the owner"
                        : "👤 You are a member"}

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
                          disabled={isFull}
                          onClick={() => {
                            setSelectedTeam(
                              team.id
                            );
                            setInviteEmail("");
                          }}
                        >
                          {isFull
                            ? "Full"
                            : "Invite"}
                        </button>
                      )}

                    </div>

                    {/* INVITE BOX */}

                    {selectedTeam ===
                      team.id &&
                      isOwner && (

                        <div className="invite-box">

                          <input
                            type="email"
                            placeholder="member@email.com"
                            value={
                              inviteEmail
                            }
                            onChange={(
                              e
                            ) =>
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
                          >
                            Send Invite
                          </button>

                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                              setSelectedTeam(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>

                        </div>

                      )}

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}