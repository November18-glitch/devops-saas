const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  window.location.href =
    "/login?redirect=" +
    encodeURIComponent(`/join?token=${token}`);
  return;
}

const response = await fetch("/api/acceptInvite", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    inviteToken: token,
  }),
});

const result = await response.json();

if (!response.ok) {
  alert(result.error || "Could not accept invitation.");
  return;
}

alert("🎉 You joined the team!");

window.location.href = "/";