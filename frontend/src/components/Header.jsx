import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) return;

      const currentUser = data.user;

      setUser(currentUser);

      setAvatar(currentUser.user_metadata?.avatar_url || null);

      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", currentUser.id)
        .single();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      } else {
        const fallbackName =
          currentUser.email?.split("@")[0] || "Member";

        setFullName(fallbackName);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const newAvatar = event.detail;

      setAvatar(newAvatar);

      setUser((prev) => ({
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          avatar_url: newAvatar,
        },
      }));
    };

    window.addEventListener("avatar-updated", handler);

    return () => {
      window.removeEventListener("avatar-updated", handler);
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      setFullName(event.detail);
    };

    window.addEventListener("name-updated", handler);

    return () => {
      window.removeEventListener("name-updated", handler);
    };
  }, []);

  const displayName =
    fullName ||
    user?.email?.split("@")[0] ||
    "Member";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 30px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="profile"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #e5e7eb",
            }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#e2e8f0",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {initial}
          </div>
        )}

        <div>
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Welcome back 👋
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {displayName}
          </div>
        </div>
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
        style={{
          background: "#6366f1",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Log out
      </button>
    </div>
  );
}