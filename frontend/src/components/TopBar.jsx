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
        padding: "14px 24px",
        background: "rgba(5, 5, 5, 0.92)",
        borderBottom: "1px solid var(--border)",
        color: "var(--text)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(12px)",
      }}
    >
      <div>
        {user ? (
          <strong
            style={{
              color: "var(--text)",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Welcome back 👋{" "}
            <span style={{ color: "#a78bfa" }}>{username}</span>
          </strong>
        ) : (
          <span
            style={{
              color: "var(--muted)",
              fontSize: 15,
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
            padding: "9px 14px",
            borderRadius: 9,
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-soft)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}
    </header>
  );
}