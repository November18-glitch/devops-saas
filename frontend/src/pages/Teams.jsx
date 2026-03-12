import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient";

export default function Teams() {

  const [teamMembers, setTeamMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  async function loadTeamMembers() {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")

    if (!error) {
      setTeamMembers(data)
    }
  }

  async function inviteUser() {

    if (!inviteEmail) {
      alert("Enter an email")
      return
    }

    setLoading(true)

    try {

      // generate invite token
      const token = crypto.randomUUID()

      // store invite in Supabase
      const { error } = await supabase
        .from("team_invites")
        .insert([
          {
            email: inviteEmail,
            token: token,
            status: "pending"
          }
        ])

      if (error) {
       console.error("SUPABASE ERROR:", error)
       alert(error.message)
       setLoading(false)
       return
      }

      // call Vercel API to send email
      await fetch("/api/sendInviteEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: inviteEmail,
          token: token
        })
      })

      alert("Invite sent!")

      setInviteEmail("")

    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Team Members</h1>

      <div style={{ marginTop: "20px" }}>

        <input
          type="email"
          placeholder="Enter email to invite"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px"
          }}
        />

        <button
          onClick={inviteUser}
          disabled={loading}
          style={{
            padding: "10px 20px"
          }}
        >
          {loading ? "Sending..." : "Invite"}
        </button>

      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Current Team</h2>

        {teamMembers.length === 0 && (
          <p>No team members yet</p>
        )}

        {teamMembers.map((member) => (
          <div
            key={member.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd"
            }}
          >
            {member.email}
          </div>
        ))}
      </div>

    </div>
  )
}