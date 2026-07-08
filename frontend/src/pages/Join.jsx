import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {

  const [params] = useSearchParams();

  useEffect(() => {

    async function joinTeam() {

      const token = params.get("token");

      if (!token) return;

      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", token)
        .single();

      if (!invite || invite.accepted) {
        alert("This invitation is no longer valid.");
      return;
      }

      const {
       data: { user },
       } = await supabase.auth.getUser();

       if (!user) {
        window.location.href = "/login";
       return;
      }

       if (user.email !== invite.email) {
        alert("This invitation was sent to another email address.");
       return;
      }

      const { data: existing } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", invite.team_id)
        .eq("user_id", user.id)
        .maybeSingle();

       if (existing) {
        window.location.href = "/teams";
       return;
       }

      await supabase.from("team_members").insert({
       team_id: invite.team_id,
       user_id: user.id,
       email: user.email,
       role: invite.role,
       status: "active"
      });

      await supabase
        .from("team_invites")
        .update({
          accepted: true,
          status: "accepted"
        })
        .eq("id", invite.id);

      window.location.href = "/teams";

    }

    joinTeam();

  }, []);

  return <div>Joining team...</div>;

}