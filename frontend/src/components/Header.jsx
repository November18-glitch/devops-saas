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
      position: "sticky",
      top: 0,
      zIndex: 50,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 30px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(5, 5, 5, 0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        minWidth: 0,
      }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt="profile"
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #34343d",
            boxShadow: "0 0 0 4px rgba(124,58,237,0.08)",
          }}
        />
      ) : (
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #6366f1, #7c3aed)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 17,
            boxShadow: "0 8px 24px rgba(99,102,241,0.18)",
          }}
        >
          {initial}
        </div>
      )}

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 2,
          }}
        >
          Welcome back 👋
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 750,
            color: "var(--text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
        background: "var(--surface-2)",
        color: "var(--text-soft)",
        border: "1px solid var(--border)",
        padding: "10px 16px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 650,
        fontSize: 13,
      }}
    >
      Log out
    </button>
  </div>
);
}