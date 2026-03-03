import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finishInvite() {

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/login");
        return;
      }

      const email = session.user.email;
      const userId = session.user.id;

      // find pending invites for this email
      const { data: invites } = await supabase
        .from("team_invites")
        .select("*")
        .eq("email", email)
        .eq("accepted", false);

      if (invites && invites.length > 0) {

        for (const invite of invites) {

          // create team membership
          await supabase.from("team_members").insert({
            team_id: invite.team_id,
            user_id: userId,
            role: invite.role,
            status: "active"
          });

          // mark invite accepted
          await supabase
            .from("team_invites")
            .update({ accepted: true })
            .eq("id", invite.id);

        }

      }

      navigate("/teams");
    }

    finishInvite();
  }, []);

  return <div>Joining team...</div>;
}