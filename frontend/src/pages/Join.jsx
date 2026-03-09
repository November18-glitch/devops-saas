import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

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

      if (!invite) return;

      const { data: { user } } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      await supabase.from("team_members").insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: "member"
      });

      await supabase
        .from("team_invites")
        .update({ accepted: true })
        .eq("id", invite.id);

      window.location.href = "/dashboard";

    }

    joinTeam();

  }, []);

  return <div>Joining team...</div>;

}