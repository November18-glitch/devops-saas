import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {

  const navigate = useNavigate();

  useEffect(() => {

    async function finishInvite() {

      // wait until Supabase session exists
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        navigate("/login");
        return;
      }

      const user = session.user;
      const email = user.email;
      const userId = user.id;

      // find pending invites for this email
      const { data: invites, error } = await supabase
        .from("team_invites")
        .select("*")
        .eq("email", email)
        .eq("accepted", false);

      if (error) {
        console.error("Invite fetch error:", error);
        navigate("/dashboard");
        return;
      }

      if (!invites || invites.length === 0) {
        navigate("/dashboard");
        return;
      }

      for (const invite of invites) {

        // prevent duplicate team member rows
        const { data: existing } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", invite.team_id)
          .eq("user_id", userId)
          .maybeSingle();

        if (!existing) {

          await supabase.from("team_members").insert({
            team_id: invite.team_id,
            user_id: userId,
            role: invite.role
          });

        }

        // mark invite accepted
        await supabase
          .from("team_invites")
          .update({ accepted: true })
          .eq("id", invite.id);

      }

      navigate("/dashboard");

    }

    finishInvite();

  }, []);

  return <div style={{padding:"40px"}}>Joining team...</div>;

}