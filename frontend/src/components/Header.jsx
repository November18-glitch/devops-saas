import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [fullName, setFullName] = useState("");

  // ----------------------------------
  // INITIAL LOAD
  // ----------------------------------

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      setUser(data.user);

      // Load avatar from auth metadata
      setAvatar(data.user.user_metadata?.avatar_url || null);

      // Load full name from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", data.user.id)
        .single();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }
    };

    loadUser();
  }, []);

  // ----------------------------------
  // LIVE AVATAR UPDATE LISTENER
  // ----------------------------------

  useEffect(() => {
    const handler = (event) => {
      const newAvatar = event.detail;

      setAvatar(newAvatar);

      // Keep auth cache in sync
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

  // ----------------------------------
  // ✅ LIVE NAME UPDATE LISTENER (ADD THIS)
  // ----------------------------------

  useEffect(() => {
    const handler = (event) => {
      setFullName(event.detail);
    };

    window.addEventListener("name-updated", handler);

    return () => {
      window.removeEventListener("name-updated", handler);
    };
  }, []);

  // ----------------------------------

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={avatar || "https://via.placeholder.com/50"}
          alt="profile"
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <div>
          <div>Welcome back 👋</div>
          <strong>{fullName || "User"}</strong>
        </div>
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }}
      >
        Log out
      </button>
    </div>
  );
}
