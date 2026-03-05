import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Join() {

  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {

    async function joinTeam() {

      const token = new URLSearchParams(window.location.search).get("token")

      if (!token) {
        setError("Invalid invite")
        setLoading(false)
        return
      }

      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", token)
        .single()

      if (!invite) {
        setError("Invite not found")
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {

        navigate(`/register?token=${token}`)
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
        .eq("token", token)

      navigate("/teams")

    }

    joinTeam()

  },[])

  if (loading) return <div>Joining team...</div>

  return <div>{error}</div>

}