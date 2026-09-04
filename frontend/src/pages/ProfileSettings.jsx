import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [plan, setPlan] = useState("FREE");
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
        .from("users")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setPlan(data.plan);
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
      .from("users")
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
    .from("users")
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

  const openBillingPortal = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch("/api/createBillingPortal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error);
  }
};

  // ----------------------------------
  // UI (UNCHANGED DESIGN)
  // ----------------------------------

  return (
  <div style={page}>
    <div style={content}>

      <div style={pageHeader}>
        <div>
          <div style={eyebrow}>
            ACCOUNT
          </div>

          <h1 style={title}>
            Profile Settings
          </h1>

          <p style={subtitle}>
            Manage your profile, account details, and subscription.
          </p>
        </div>
      </div>

      {/* PLAN */}
      <div style={planCard}>
        <div style={planLeft}>
          <div style={planIcon}>
            ✦
          </div>

          <div>
            <div style={planLabel}>
              CURRENT PLAN
            </div>

            <div style={planName}>
              {plan === "PRO"
                ? "LaunchAlly Pro"
                : "LaunchAlly Free"}
            </div>

            <div style={planDescription}>
              {plan === "PRO"
                ? "Premium deployment capabilities are active."
                : "Upgrade when you're ready for unlimited deployments."}
            </div>
          </div>
        </div>

        {plan === "PRO" && (
          <button
            onClick={openBillingPortal}
            style={manageButton}
          >
            Manage Subscription
            <span>→</span>
          </button>
        )}
      </div>

      <div style={settingsGrid}>

        {/* PROFILE */}
        <div style={profileCard}>
          <div style={cardHeader}>
            <div>
              <div style={eyebrowSmall}>
                PROFILE
              </div>

              <h2 style={cardTitle}>
                Profile Picture
              </h2>
            </div>
          </div>

          <div style={avatarArea}>
            <div style={avatarWrapper}>
              <img
                src={
                  preview ||
                  avatarUrl ||
                  "https://via.placeholder.com/150"
                }
                alt="avatar"
                style={avatar}
              />
            </div>

            <div>
              <div style={avatarTitle}>
                Your avatar
              </div>

              <div style={avatarText}>
                Upload a profile image to personalize
                your LaunchAlly workspace.
              </div>
            </div>
          </div>

          <input
            type="file"
            onChange={handleFileChange}
            style={fileInput}
          />

          <button
            onClick={saveAvatar}
            disabled={uploading}
            style={{
              ...primaryButton,
              opacity: uploading ? 0.6 : 1,
              cursor: uploading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {uploading
              ? "Uploading..."
              : "Save Picture"}
          </button>
        </div>

        {/* ACCOUNT DETAILS */}
        <div style={profileCard}>
          <div style={cardHeader}>
            <div>
              <div style={eyebrowSmall}>
                ACCOUNT
              </div>

              <h2 style={cardTitle}>
                Account Details
              </h2>
            </div>
          </div>

          <div style={field}>
            <label style={label}>
              Full Name
            </label>

            <div style={fieldRow}>
              <input
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                style={inputStyle}
              />

              <button
                onClick={saveName}
                style={smallButton}
              >
                Save
              </button>
            </div>
          </div>

          <div style={field}>
            <label style={label}>
              Email
            </label>

            <div style={fieldRow}>
              <input
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={inputStyle}
              />

              <button
                onClick={saveEmail}
                style={smallButton}
              >
                Save
              </button>
            </div>
          </div>

          <div style={field}>
            <label style={label}>
              Password
            </label>

            <div style={fieldRow}>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                style={inputStyle}
              />

              <button
                onClick={savePassword}
                style={smallButton}
              >
                Update
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
);
}

/* =========================
   STYLES
========================= */

const page = {
  minHeight: "100vh",
  background: "var(--bg)",
  color: "var(--text)",
  padding: "34px 28px 60px",
};

const content = {
  maxWidth: 1050,
  margin: "0 auto",
};

const pageHeader = {
  marginBottom: 25,
};

const eyebrow = {
  color: "#8b5cf6",
  fontSize: 10,
  fontWeight: 850,
  letterSpacing: "1.5px",
  marginBottom: 7,
};

const eyebrowSmall = {
  color: "#8b5cf6",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1.2px",
  marginBottom: 5,
};

const title = {
  margin: 0,
  color: "var(--text)",
  fontSize: 30,
  fontWeight: 850,
  letterSpacing: "-.7px",
};

const subtitle = {
  margin: "7px 0 0",
  color: "var(--muted)",
  fontSize: 13,
};

const planCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  padding: 20,
  marginBottom: 18,
  background:
    "linear-gradient(145deg,#111116,#0d0d10)",
  border: "1px solid #292934",
  borderRadius: 16,
  boxShadow: "0 12px 40px rgba(0,0,0,.22)",
};

const planLeft = {
  display: "flex",
  alignItems: "center",
  gap: 13,
};

const planIcon = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 11,
  background:
    "linear-gradient(135deg,#22194a,#17132e)",
  border: "1px solid #3b2a7a",
  color: "#c4b5fd",
  fontWeight: 900,
};

const planLabel = {
  color: "#73737e",
  fontSize: 9,
  fontWeight: 850,
  letterSpacing: "1px",
};

const planName = {
  color: "var(--text)",
  fontSize: 15,
  fontWeight: 800,
  marginTop: 3,
};

const planDescription = {
  color: "var(--muted)",
  fontSize: 11,
  marginTop: 3,
};

const manageButton = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 10,
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text-soft)",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
};

const settingsGrid = {
  display: "grid",
  gridTemplateColumns:
    "minmax(280px, .8fr) minmax(400px, 1.2fr)",
  gap: 18,
  alignItems: "start",
};

const profileCard = {
  background:
    "linear-gradient(145deg,#101014,#0c0c0f)",
  border: "1px solid var(--border)",
  borderRadius: 17,
  padding: 22,
  boxShadow: "0 12px 40px rgba(0,0,0,.20)",
};

const cardHeader = {
  marginBottom: 20,
};

const cardTitle = {
  margin: 0,
  color: "var(--text)",
  fontSize: 17,
  fontWeight: 800,
};

const avatarArea = {
  display: "flex",
  alignItems: "center",
  gap: 13,
  marginBottom: 17,
};

const avatarWrapper = {
  width: 78,
  height: 78,
  flexShrink: 0,
  padding: 3,
  borderRadius: "50%",
  background:
    "linear-gradient(135deg,#6366f1,#7c3aed)",
  boxShadow: "0 10px 30px rgba(99,102,241,.16)",
};

const avatar = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
  border: "3px solid #0d0d10",
};

const avatarTitle = {
  color: "var(--text)",
  fontWeight: 750,
  fontSize: 12,
  marginBottom: 4,
};

const avatarText = {
  color: "var(--muted)",
  fontSize: 10,
  lineHeight: 1.5,
  maxWidth: 230,
};

const fileInput = {
  width: "100%",
  marginBottom: 12,
  padding: 9,
  borderRadius: 9,
  border: "1px dashed #34343e",
  background: "#09090c",
  color: "var(--muted)",
  fontSize: 11,
  boxSizing: "border-box",
};

const primaryButton = {
  width: "100%",
  padding: 11,
  borderRadius: 10,
  border: "1px solid rgba(139,92,246,.35)",
  background:
    "linear-gradient(135deg,#6366f1,#7c3aed)",
  color: "white",
  fontWeight: 750,
  cursor: "pointer",
  fontSize: 12,
  boxShadow: "0 8px 22px rgba(99,102,241,.15)",
};

const field = {
  marginBottom: 17,
};

const label = {
  display: "block",
  color: "#b8b8c2",
  fontSize: 11,
  fontWeight: 700,
  marginBottom: 7,
};

const fieldRow = {
  display: "flex",
  gap: 8,
};

const inputStyle = {
  flex: 1,
  minWidth: 0,
  padding: "11px 12px",
  borderRadius: 9,
  border: "1px solid var(--border)",
  background: "#08080b",
  color: "var(--text)",
  outline: "none",
  fontSize: 12,
  boxSizing: "border-box",
  colorScheme: "dark",
};

const smallButton = {
  flexShrink: 0,
  padding: "10px 13px",
  borderRadius: 9,
  border: "1px solid rgba(139,92,246,.35)",
  background:
    "linear-gradient(135deg,#6366f1,#7c3aed)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 11,
};