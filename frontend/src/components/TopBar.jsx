import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div>
        {user ? (
          <strong>Welcome back 👋 {user.user?.user_metadata?.username}</strong>
        ) : (
          <span>Welcome</span>
        )}
      </div>

      {user && (
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      )}
    </header>
  );
}
