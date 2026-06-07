import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/logo.png";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("invite");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },

        emailRedirectTo:
          "https://launchally.org/auth/callback",
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // accept invite
    if (inviteToken) {
      await supabase.rpc("accept_invite", {
        invite_token: inviteToken,
      });
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoWrapper}>
            <img
              src={logo}
              alt="LaunchAlly"
              style={{
                width: 46,
                height: 46,
                objectFit: "contain",
              }}
            />

            <h2 style={styles.title}>
              Check your email
            </h2>
          </div>

          <p style={styles.successText}>
            We sent you a confirmation email.
            <br />
            Please verify your account before signing in.
          </p>

          <Link to="/login" style={styles.loginButton}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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

          <h2 style={styles.title}>Create account</h2>
        </div>

        <p style={styles.subtitle}>
          Start deploying apps with LaunchAlly.
        </p>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Username</label>

          <input
            autoComplete="username"
            required
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
          />

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
            autoComplete="new-password"
            required
            minLength={6}
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
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
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
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

  successText: {
    textAlign: "center",
    color: "#475569",
    lineHeight: 1.7,
    marginBottom: 28,
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

  loginButton: {
    display: "block",
    textAlign: "center",
    background: "#6366f1",
    color: "white",
    textDecoration: "none",
    padding: 14,
    borderRadius: 10,
    fontWeight: 600,
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