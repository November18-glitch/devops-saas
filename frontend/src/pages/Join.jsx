import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Join() {

  const [params] = useSearchParams();

  useEffect(() => {

    async function joinTeam() {
      console.log("JOIN PAGE OPENED");

      let token =
       params.get("token")

       if (token?.startsWith("/join?token=")) {
        token = token.replace("/join?token=", "");
      }

      console.log("FINAL TOKEN:", token);
       alert(token);

      if (!token) return;


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

   window.location.replace(
    "/login?redirect=" +
    encodeURIComponent(`/join?token=${token}`)
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
  const { data, error: memberError } =
await supabase
.from("team_members")
.insert({
  team_id: invite.team_id,
  user_id: user.id,
  email: user.email,
  role: invite.role || "member",
  status: "active",
})
.select();

console.log("INSERT RESULT", data);
console.log("INSERT ERROR", memberError);

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

      console.log("SUCCESS - inserted member");
      alert("Inserted member successfully");

    }

    joinTeam();

  }, []);

  return (
  <div
    style={{
      fontSize: 40,
      color: "red",
      padding: 100,
    }}
  >
    JOIN PAGE
  </div>
);
}