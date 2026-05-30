import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

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
    navigate("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <img
            src={logo}
            alt="DeployAlly"
            style={{
              width: 42,
              height: 42,
              objectFit: "contain",
            }}
          />

          <h2 style={styles.title}>DeployAlly</h2>
        </div>

        <p style={styles.subtitle}>
          Welcome back. Sign in to continue.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
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
          <Link to="/register">Register</Link>
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
    background: "#fafafa",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    padding: 32,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
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
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
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
  },

  input: {
    padding: 12,
    marginBottom: 18,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },

  button: {
    padding: 14,
    background: "#6366f1",
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
    color: "#64748b",
  },
};