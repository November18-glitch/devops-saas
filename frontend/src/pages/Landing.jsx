import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/logo.png";
import demoVideo from "../assets/DeployAlly.mp4";

export default function Landing() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 35%), #0f172a",
          color: "white",
          fontFamily: "Inter, sans-serif",
          overflowX: "hidden",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 40px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.8)",
          }}
        >
          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={logo}
              alt="LaunchAlly Logo"
              style={{ width: 38, height: 38, objectFit: "contain" }}
            />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              LaunchAlly
            </h1>
          </div>

          {/* NAV LINKS */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link
              to="/login"
              style={{
                color: "#cbd5e1",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
                transition: "0.2s ease",
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={{
                background: "#6366f1",
                padding: "10px 20px",
                borderRadius: 8,
                color: "white",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "100px 20px 60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60,
            flexWrap: "wrap",
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(99,102,241,0.1)",
                color: "#a5b4fc",
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
                border: "1px solid rgba(99,102,241,0.2)",
                letterSpacing: "0.5px",
              }}
            >
              ⚡ Launch your app in minutes — no DevOps required
            </div>

            <h1
              style={{
                fontSize: "clamp(38px, 5vw, 56px)",
                lineHeight: 1.1,
                marginBottom: 20,
                fontWeight: 800,
                letterSpacing: -1.5,
              }}
            >
              Deploy your full-stack app in minutes.
              No servers. No DevOps. No headaches.
            </h1>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "#94a3b8",
                marginBottom: 36,
                maxWidth: 580,
              }}
            >
              Connect your GitHub repository, configure your environment variables, and deploy your application from one simple dashboard.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link
                to="/register"
                style={{
                  background: "#6366f1",
                  padding: "14px 28px",
                  borderRadius: 10,
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 10px 25px rgba(99,102,241,0.3)",
                }}
              >
                Start Deploying Free
              </Link>
              <button
                onClick={() => setShowVideo(true)}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "14px 24px",
                  borderRadius: 10,
                  color: "white",
                  background: "rgba(255,255,255,0.03)",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                }}
              >
                ▶ See How It Works
              </button>
            </div>
          </div>

          <div
  style={{
    marginTop: 30,
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    color: "#94a3b8",
    fontSize: 15,
  }}
>
  <span>⚡ Deploy in under 2 minutes</span>

  <span>🔒 Secure GitHub OAuth</span>

  <span>🌍 Production-ready deployments</span>
</div>

          {/* RIGHT COLUMN: INTERACTIVE APP CONTAINER */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              background: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.3), 0 0 50px rgba(99,102,241,0.05)",
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
            </div>

            <div
  style={{
    background: "#0f172a",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.05)",
    overflow: "hidden",
  }}
>
  {/* Header */}
  <div
    style={{
      padding: "16px 20px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <strong>Deployment #42</strong>

    <span
      style={{
        color: "#22c55e",
        background: "rgba(34,197,94,.12)",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      SUCCESS
    </span>
  </div>

  <div style={{ padding: 20 }}>

    <DashboardRow label="Repository" value="my-company/api" />
    <DashboardRow label="Branch" value="main" />
    <DashboardRow label="Environment" value="Production" />
    <DashboardRow label="Latest Commit" value="e812af4" />

    <div
      style={{
        marginTop: 20,
        background: "#020617",
        borderRadius: 10,
        padding: 16,
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 1.8,
        color: "#94a3b8",
      }}
    >
      ✓ Installing dependencies<br />
      ✓ Building application<br />
      ✓ Creating Docker image<br />
      ✓ Deploying container<br />
      <span style={{ color: "#22c55e" }}>
        ✓ Deployment completed
      </span>
    </div>

    <div
      style={{
        marginTop: 20,
        background: "rgba(99,102,241,.08)",
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 12,
        }}
      >
        LIVE URL
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#a5b4fc",
          fontWeight: 600,
        }}
      >
        https://myapp.launchally.app
      </div>
    </div>

  </div>
</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div style={{ background: "rgba(15,23,42,0.4)", padding: 12, borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>
                🎯 Workspace: <b>Founders-HQ</b>
              </div>
              <div style={{ background: "rgba(15,23,42,0.4)", padding: 12, borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>
                👥 Team Sync: <b>Connected</b>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCE TARGETING STRIP */}
        <section style={{ borderY: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.4)", padding: "24px 20px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyItems: "center", justifyContent: "center", gap: "clamp(20px, 5vw, 60px)", flexWrap: "wrap", color: "#64748b", fontWeight: 600 }}>
            <span style={{ color: "#94a3b8" }}>BUILT FOR:</span>
            <span>✓ Indie Hackers</span>
            <span>✓ SaaS Founders</span>
            <span>✓ Startup Teams</span>
            <span>✓ Freelancers & Agencies</span>
          </div>
        </section>

        {/* CONCRETE VALUE FEATURES */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 20px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 12, letterSpacing: -1 }}>
            Run your startup infrastructure without the complexity
          </h2>
          <p style={{ color: "#94a3b8", textAlign: "center", fontSize: 16, marginBottom: 60 }}>
            Stop configuration hopping. Manage your assets directly.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            <FeatureCard
              icon="🚀"
              title="Connect GitHub"
              text="Paste your repository and LaunchAlly prepares everything automatically."
            />
            <FeatureCard
              icon="📈"
              title="Track Deployments"
              text="See build logs, deployment status, and your live URL in one place."
            />
            <FeatureCard
              icon="📁"
              title="Manage Projects"
              text="Keep repositories, deployments and environments organized inside your workspace."
            />
            <FeatureCard
              icon="🤝"
              title="Work Together"
              text="Invite teammates and manage projects together from a shared workspace."
            />
          </div>
        </section>

        {/* WHY TEAMS CHOOSE LAUNCHALLY */}
<section
  style={{
    background: "rgba(30,41,59,0.2)",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    padding: "100px 20px",
  }}
>
  <div
    style={{
      maxWidth: 1000,
      margin: "0 auto",
    }}
  >
    <h2
      style={{
        fontSize: 36,
        fontWeight: 800,
        textAlign: "center",
        marginBottom: 16,
        letterSpacing: -1,
      }}
    >
      Why Teams Choose LaunchAlly
    </h2>

    <p
      style={{
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 60,
        fontSize: 16,
        maxWidth: 700,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      LaunchAlly brings projects, deployments, monitoring, and collaboration
      together so small teams can stay focused on building instead of juggling
      multiple tools.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
        gap: 24,
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 14 }}>🚀</div>

        <h3
          style={{
            marginBottom: 12,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          One-Click Deployments
        </h3>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          Connect your repository, manage deployments, and launch applications
          from one workspace.
        </p>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 14 }}>👥</div>

        <h3
          style={{
            marginBottom: 12,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Team Workspaces
        </h3>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          Organize projects, collaborate with teammates, and keep everyone
          aligned inside a shared workspace.
        </p>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 14 }}>📊</div>

        <h3
          style={{
            marginBottom: 12,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Deployment Insights
        </h3>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          Track deployments, view status updates, and stay informed about what
          is happening across your projects.
        </p>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 30, marginBottom: 14 }}>✨</div>

        <h3
          style={{
            marginBottom: 12,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          No DevOps Experience Needed
        </h3>

        <p
          style={{
            color: "#94a3b8",
            lineHeight: 1.7,
          }}
        >
          Designed for founders, indie hackers, and small teams who want a
          simple way to manage software projects without DevOps complexity.
        </p>
      </div>
    </div>
  </div>
</section>
        <section
  style={{
    maxWidth: 1100,
    margin: "0 auto",
    padding: "80px 20px",
  }}
>

<h2
style={{
fontSize:36,
fontWeight:800,
textAlign:"center",
marginBottom:16,
}}
>
Deploy in 4 Simple Steps
</h2>

<p
style={{
textAlign:"center",
color:"#94a3b8",
marginBottom:60,
}}
>
Launch your application from GitHub to production in just a few clicks.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:24,
}}
>

<Step
number="1"
title="Connect GitHub"
text="Authorize LaunchAlly and choose your repository."
/>

<Step
number="2"
title="Configure Variables"
text="Add your environment variables securely."
/>

<Step
number="3"
title="Click Deploy"
text="LaunchAlly builds and deploys your application automatically."
/>

<Step
number="4"
title="Share Your URL"
text="Your production application is live and ready to use."
/>

</div>

</section>

        {/* PRICING */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 100px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 12 }}>
            Transparent Plans for Every Stage
          </h2>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: 48 }}>
            Start managing infrastructure for free, upgrade smoothly as your operation shifts up.
          </p>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {/* FREE TIER */}
            <div style={{ flex: 1, minWidth: 280, background: "rgba(17,24,39,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
              <h3 style={{ fontSize: 20, margin: 0 }}>Free Tier</h3>
              <div style={{ fontSize: 36, fontWeight: 800, margin: "16px 0" }}>$0</div>
              <ul style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 2 }}>
                <li>1 Project</li>
                <li>up to 5 Deployments</li>
                <li>Team workspaces</li>
                <li>Deployment logs</li>
              </ul>
            </div>

            {/* PRO TIER */}
            <div style={{ flex: 1, minWidth: 280, background: "rgba(99,102,241,0.05)", border: "2px solid #6366f1", borderRadius: 16, padding: 32, position: "relative" }}>
              <span style={{ position: "absolute", top: 16, right: 16, background: "#6366f1", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>⭐ Most Popular</span>
              <h3 style={{ fontSize: 20, margin: 0, color: "#a5b4fc" }}>Pro SaaS</h3>
              <div style={{ fontSize: 36, fontWeight: 800, margin: "16px 0" }}>$5<span style={{ fontSize: 14, color: "#64748b" }}>/mo</span></div>
              <ul style={{ paddingLeft: 20, color: "#cbd5e1", lineHeight: 2 }}>
                <li>Unlimited projects</li>
                <li>Unlimited Deployments</li>
                <li>Team Invites</li>
                <li>AI-powered Debugging</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 80px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(15,23,42,0.6))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
              Ready to Deploy Your Next Project?
            </h2>
            <p style={{ color: "#cbd5e1", maxWidth: 600, margin: "0 auto 32px", fontSize: 16, lineHeight: 1.6 }}>
              Stop jumping between five tabs to monitor one application codebase. Bring structure to your launch process.
            </p>
            <Link
              to="/register"
              style={{
                display: "inline-block",
                background: "#6366f1",
                padding: "16px 32px",
                borderRadius: 10,
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                boxShadow: "0 10px 30px rgba(99,102,241,0.3)",
              }}
            >
              Start Deploying Free
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "32px 20px",
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
          }}
        >
          © {new Date().getFullYear()} LaunchAlly. Deploy applications without DevOps complexity.
        </footer>
      </div>

      {/* VIDEO MODAL CONTAINER */}
      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 20,
            backdropFilter: "blur(8px)",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 960, position: "relative" }}>
            <button
              onClick={() => setShowVideo(false)}
              style={{
                position: "absolute",
                top: -45,
                right: 0,
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 36,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <video
              controls
              autoPlay
              style={{
                width: "100%",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "black",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              <source src={demoVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  );
}

{/* REFACTORED CLEAN COMPONENTS */}
function FeatureCard({ icon, title, text }) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.3)",
        padding: 32,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.05)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
        {title}
      </h3>
      <p style={{ color: "#94a3b8", lineHeight: 1.6, margin: 0, fontSize: 14 }}>
        {text}
      </p>
    </div>
  );
}

function DashboardRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
        color: "#cbd5e1",
        fontSize: 14,
      }}
    >
      <span style={{ color: "#64748b" }}>
        {label}
      </span>

      <span>{value}</span>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div
      style={{
        background: "rgba(30,41,59,.35)",
        borderRadius: 16,
        padding: 28,
        border: "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#6366f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          marginBottom: 18,
        }}
      >
        {number}
      </div>

      <h3>{title}</h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  );
}