import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function finishInvite() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) return;

      const email = session.user.email;
      const userId = session.user.id;

      await supabase
        .from("team_members")
        .update({
          user_id: userId,
          status: "active",
        })
        .eq("email", email)
        .eq("status", "pending");

      navigate("/teams");
    }

    finishInvite();
  }, []);

  return <div>Joining team...</div>;
}