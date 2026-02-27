import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProfileSettings from "./pages/ProfileSettings";
import Teams from "./pages/Teams";
import AuthCallback from "./pages/AuthCallback";

// Layout
import Layout from "./components/Layout";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔒 IMPORTANT: prevents blank screen
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!session ? (
        // 🔓 NOT LOGGED IN
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        // 🔐 LOGGED IN
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
