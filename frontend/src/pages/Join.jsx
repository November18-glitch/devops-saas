import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {

  const [params] = useSearchParams();

  useEffect(() => {

    async function joinTeam() {
      console.log("JOIN PAGE OPENED");

      let token =
       params.get("token") ||
       localStorage.getItem("inviteToken");

       console.log("TOKEN:", token);

      if (!token) return;

      // Save it in case the user has to log in/register
       localStorage.setItem("inviteToken", token);

      const { data: invite } = await supabase
        .from("team_invites")
        .select("*")
        .eq("token", token)
        .single();

        console.log("INVITE:", invite);

      if (!invite || invite.accepted) {
        alert("This invitation is no longer valid.");
      return;
      }

      let {
  data: { user },
} = await supabase.auth.getUser();

console.log("USER:", user);
// Wait a few seconds after signup/login
if (!user) {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = await supabase.auth.getUser();
    user = result.data.user;

    if (user) break;
  }
}

if (!user) {
  const redirect = encodeURIComponent(`/join?token=${token}`);

   localStorage.setItem("inviteToken", token);

   window.location.replace(
   "/login?redirect=" +
    encodeURIComponent("/join")
   );
  return;
}

       if (user.email !== invite.email) {
         alert(
           `This invite was sent to ${invite.email}.\n\nPlease sign out and sign in with that account.`
          );

          await supabase.auth.signOut();

          window.location.href =
           "/login?redirect=" +
          encodeURIComponent(`/join?token=${token}`);

          return;
       }

      const { data: existing } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", invite.team_id)
        .eq("user_id", user.id)
        .maybeSingle();

       if (existing) {
        console.log("SUCCESS - inserted member");
        alert("Inserted member successfully");
       return;
       }

      const { data: existingMember } = await supabase
  .from("team_members")
  .select("id")
  .eq("team_id", invite.team_id)
  .eq("user_id", user.id)
  .maybeSingle();

if (!existingMember) {
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: invite.team_id,
      user_id: user.id,
      email: user.email,
      role: invite.role || "member",
      status: "active",
    });

  if (memberError) {
    console.error(memberError);
    alert(memberError.message);
    return;
  }
}

await supabase
  .from("team_invites")
  .update({
    accepted: true,
    status: "accepted",
  })
  .eq("id", invite.id);

  localStorage.removeItem("inviteToken");

      console.log("SUCCESS - inserted member");
      alert("Inserted member successfully");

    }

    joinTeam();

  }, []);

  return <div>Joining team...</div>;

}