import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  // ----------------------------------
  // LOAD USER + PROFILE
  // ----------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      setUser(auth.user);
      setEmail(auth.user.email);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
    };

    loadProfile();
  }, []);

  // ----------------------------------
  // IMAGE SELECT
  // ----------------------------------

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    // Instant preview (no waiting)
    const localPreview = URL.createObjectURL(selected);
    setPreview(localPreview);
  };

  // ----------------------------------
  // SAVE AVATAR (INSTANT UX)
  // ----------------------------------

  const saveAvatar = async () => {
    if (!file || !user || uploading) return;

    setUploading(true);

    // ✅ SHOW IMAGE IMMEDIATELY
    if (preview) {
      setAvatarUrl(preview);

      window.dispatchEvent(
        new CustomEvent("avatar-updated", {
          detail: preview,
        })
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

    // Update DB
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    // ✅ FINAL OFFICIAL URL REPLACE
    setAvatarUrl(publicUrl);

    window.dispatchEvent(
      new CustomEvent("avatar-updated", {
        detail: publicUrl,
      })
    );

    setPreview(null);
    setFile(null);
    setUploading(false);
  };

  // ----------------------------------
  // SAVE NAME
  // ----------------------------------

 const saveName = async () => {
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  // 🔥 INSTANT UI UPDATE
  window.dispatchEvent(
    new CustomEvent("name-updated", {
      detail: fullName,
    })
  );

  alert("Name updated");
};


  // ----------------------------------
  // SAVE EMAIL
  // ----------------------------------

  const saveEmail = async () => {
    if (!email) return;

    const { error } = await supabase.auth.updateUser({ email });

    if (error) alert(error.message);
    else alert("Confirmation email sent");
  };

  // ----------------------------------
  // SAVE PASSWORD
  // ----------------------------------

  const savePassword = async () => {
    if (!newPassword) return;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) alert(error.message);
    else {
      alert("Password updated");
      setNewPassword("");
    }
  };

  // ----------------------------------
  // UI (UNCHANGED DESIGN)
  // ----------------------------------

  return (
    <div
      style={{
        background: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
        maxWidth: 800,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Profile Settings</h2>

      <div style={{ display: "flex", gap: 40 }}>
        {/* LEFT COLUMN */}
        <div>
          <h4>Profile Picture</h4>

          <img
            src={preview || avatarUrl || "https://via.placeholder.com/150"}
            alt="avatar"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 10,
            }}
          />

          <div>
            <input type="file" onChange={handleFileChange} />
          </div>

          <button
            onClick={saveAvatar}
            disabled={uploading}
            style={{
              marginTop: 10,
              padding: "8px 14px",
              borderRadius: 6,
              background: "#6366f1",
              color: "#fff",
              border: "none",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? "Uploading..." : "Save Picture"}
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <label>Full Name</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
              />
              <button onClick={saveName} style={btnStyle}>
                Save Name
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>Email</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <button onClick={saveEmail} style={btnStyle}>
                Save Email
              </button>
            </div>
          </div>

          <div>
            <label>Password</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <button onClick={savePassword} style={btnStyle}>
                Save Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ddd",
  flex: 1,
};

const btnStyle = {
  padding: "8px 14px",
  borderRadius: 6,
  background: "#6366f1",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
