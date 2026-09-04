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
    <header
      style={{
        minHeight: 70,
        padding: "10px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        background: "rgba(8, 8, 10, 0.96)",
        borderBottom: "1px solid var(--border)",

        color: "var(--text)",

        position: "sticky",
        top: 0,
        zIndex: 100,

        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",

        boxSizing: "border-box",
      }}
    >
      {/* USER AREA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 13,
          minWidth: 0,
        }}
      >
        {/* AVATAR */}
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #292933",
              boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.08)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--accent-2), var(--accent))",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
              boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.08)",
            }}
          >
            {initial}
          </div>
        )}

        {/* NAME */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              lineHeight: 1,
              color: "var(--muted)",
              fontWeight: 500,
            }}
          >
            Welcome back 👋
          </span>

          <span
            style={{
              fontSize: 15,
              lineHeight: 1.15,
              color: "var(--text)",
              fontWeight: 750,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 260,
            }}
          >
            {displayName}
          </span>
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
        style={{
          height: 38,
          padding: "0 16px",

          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 9,

          color: "var(--text-soft)",

          fontSize: 13,
          fontWeight: 700,

          cursor: "pointer",

          transition:
            "background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease",

          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--surface-3)";
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.color = "var(--text)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--surface-2)";
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-soft)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Log out
      </button>
    </header>
  );
}