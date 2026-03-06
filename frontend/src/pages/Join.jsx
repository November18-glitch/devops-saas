import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"

export default function Join() {

  const navigate = useNavigate()

  useEffect(() => {

    async function joinTeam() {

      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")

      if (!token) return

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", token)
        .single()

      if (!invite) {
        alert("Invite invalid")
        return
      }

      await supabase.from("team_members").insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: invite.role
      })

      await supabase
        .from("team_invites")
        .update({ accepted: true })
        .eq("id", invite.id)

      navigate("/dashboard")

    }

    joinTeam()

  }, [])

  return <div>Joining team...</div>

}