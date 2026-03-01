import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("invite");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    // accept invite if user came from invite link
    if (inviteToken) {
      await supabase.rpc("accept_invite", {
        invite_token: inviteToken,
      });
    }

    alert("Account created!\n\nPlease check your email to confirm your account before logging in.");

    // redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>SaaS Logo + Name</h2>

        <form onSubmit={handleRegister} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            required
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label style={styles.label}>Email address</label>
          <input
            type="email"
            required
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button}>Register</button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fafafa",
  },
  card: {
    width: 360,
    padding: 32,
    background: "#fff",
    borderRadius: 6,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    padding: 10,
    marginBottom: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    padding: 12,
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    marginTop: 8,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
};