import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallback() {

  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {

    async function handleInvite() {

      const inviteToken = params.get("invite");

      if (!inviteToken) {
        navigate("/dashboard");
        return;
      }

      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", inviteToken)
        .single();

      if (!invite) {
        navigate("/dashboard");
        return;
      }

      const { data: { user } } =
        await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
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

      navigate("/dashboard");

    }

    handleInvite();

  }, []);

  return <div>Joining team...</div>;
}