import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  const username =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 70,
        padding: "12px 24px",
        background: "rgba(8, 8, 10, 0.96)",
        borderBottom: "1px solid var(--border)",
        color: "var(--text)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {user ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              lineHeight: 1.2,
            }}
          >
            <span
              style={{
                color: "var(--muted)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Welcome back 👋
            </span>

            <strong
              style={{
                color: "var(--text)",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {username}
            </strong>
          </div>
        ) : (
          <span
            style={{
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            Welcome
          </span>
        )}
      </div>

      {user && (
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          style={{
            padding: "9px 15px",
            borderRadius: 9,
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-soft)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition:
              "background .18s ease, border-color .18s ease, color .18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-soft)";
          }}
        >
          Log out
        </button>
      )}
    </header>
  );
}