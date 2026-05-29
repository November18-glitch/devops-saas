import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectPage from "./pages/ProjectPage";
import ProfileSettings from "./pages/ProfileSettings";
import Teams from "./pages/Teams";
import AuthCallback from "./pages/AuthCallback";
import Join from "./pages/Join";
import User from "./pages/User";
import Landing from "./pages/Landing";

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
    <Routes>

      {/* PUBLIC */}
      <Route
        path="/"
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Landing />
          )
        }
      />

      <Route
        path="/login"
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/register"
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register />
          )
        }
      />

      {/* PROTECTED */}
      {session && (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<User />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/join" element={<Join />} />
          <Route
            path="/profile-settings"
            element={<ProfileSettings />}
          />
        </Route>
      )}

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          <Navigate
            to={session ? "/dashboard" : "/"}
            replace
          />
        }
      />

    </Routes>
  </BrowserRouter>
  );
}