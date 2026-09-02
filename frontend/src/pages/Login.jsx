import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // smooth redirect
    const params = new URLSearchParams(location.search);

    const redirect =
     params.get("redirect");

    window.location.replace(
     redirect || "/dashboard"
    );
  };

  const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://launchally.org/auth/callback",
    },
  });
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <img
            src={logo}
            alt="LaunchAlly"
            style={{
              width: 42,
              height: 42,
              objectFit: "contain",
            }}
          />

          <h2 style={styles.title}>LaunchAlly</h2>
        </div>

        <p style={styles.subtitle}>
          Welcome back. Sign in to continue.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <button
  type="button"
  onClick={handleGoogleLogin}
  style={styles.googleButton}
>
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt="Google"
    style={{
      width: 20,
      height: 20,
      marginRight: 10,
    }}
  />
  Continue with Google
</button>

<div style={styles.divider}>
  <span>or</span>
</div>
          <label style={styles.label}>Email address</label>

          <input
            type="email"
            autoComplete="email"
            required
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            autoComplete="current-password"
            required
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <Link
             to={`/register${location.search}`}
            >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#050505",
    padding: 20,
  },

  card: {
  width: "100%",
  maxWidth: 380,
  padding: 32,
  background: "#0d0d0d",
  borderRadius: 16,
  boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  border: "1px solid #262626",
},

  logoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
    fontSize: 28,
    color: "#f5f5f5",
  },

  subtitle: {
    textAlign: "center",
    color: "#a1a1aa",
    marginBottom: 28,
    fontSize: 15,
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 500,
    color: "#d4d4d8",
  },

  input: {
  padding: 12,
  marginBottom: 18,
  borderRadius: 10,
  border: "1px solid #303030",
  background: "#111111",
  color: "#f5f5f5",
  fontSize: 15,
  outline: "none",
},

  button: {
  padding: 14,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 15,
  marginTop: 8,
},

  error: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 8,
  },

  footer: {
  marginTop: 22,
  textAlign: "center",
  fontSize: 14,
  color: "#71717a",
},

  googleButton: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "1px solid #303030",
  background: "#111111",
  color: "#f5f5f5",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  marginBottom: 18,
},

  divider: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
    color: "#64748b",
    fontSize: 14,
  },
};