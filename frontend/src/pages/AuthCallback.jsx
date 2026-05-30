import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    async function handleAuth() {
      // IMPORTANT:
      // Creates session after email confirmation
      const { error } =
        await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

      if (error) {
        console.error(
          "Auth callback error:",
          error.message
        );

        navigate("/login");
        return;
      }

      // Handle invite logic
      const inviteToken = params.get("invite");

      // No invite → normal signup flow
      if (!inviteToken) {
        navigate("/dashboard");
        return;
      }

      // Find invite
      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", inviteToken)
        .single();

      if (!invite) {
        navigate("/dashboard");
        return;
      }

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Prevent duplicate team memberships
      const { data: existingMember } =
        await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", invite.team_id)
          .eq("user_id", user.id)
          .maybeSingle();

      // Add member if not already added
      if (!existingMember) {
        await supabase.from("team_members").insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: "member",
        });
      }

      // Mark invite accepted
      await supabase
        .from("team_invites")
        .update({ accepted: true })
        .eq("id", invite.id);

      navigate("/dashboard");
    }

    handleAuth();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "Inter, sans-serif",
        fontSize: 18,
      }}
    >
      Signing you in...
    </div>
  );
}