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
              Deploy apps without DevOps complexity
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
              Deploy and manage your app without learning DevOps.
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
              LaunchAlly helps startups launch and operate applications without needing a dedicated DevOps engineer.
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
                Deploy Free Now
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
                ▶ Watch 60s Demo
              </button>
            </div>
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
                padding: 20,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>launchally-production-api</span>
                <span style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: 12, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Active</span>
              </div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>branch: main • commit: #8f2da1</div>
              
              <div style={{ height: 6, background: "#1e293b", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ width: "100%", height: "100%", background: "#6366f1" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8" }}>
                <span>Health Score: 100%</span>
                <span>Latency: 42ms</span>
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
              title="Deploy your GitHub projects"
              text="Connect any repository and instantly boot up live deployments through a single structural control room dashboard."
            />
            <FeatureCard
              icon="📈"
              title="Monitor deployments live"
              text="Track build success states, historical variables, uptime status, and active deployment environments with deep specificity."
            />
            <FeatureCard
              icon="📁"
              title="Manage startup projects"
              text="Keep your production projects, contextual test databases, and dynamic teams cleanly divided into structural workspaces."
            />
            <FeatureCard
              icon="🤝"
              title="Collaborate with teammates"
              text="Invite developers, managers, or project founders to specific workspaces with fine-grained technical access constraints."
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
          Deploy Faster
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
          Built For Teams
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
          Monitor Everything
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
          Beginner Friendly
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

        {/* ROADMAP SECTION */}
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 20px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 12 }}>
            Product Roadmap
          </h2>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: 48 }}>
            We're building fast. Here's what's dropping next into your operating system workspace.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <RoadmapCard step="01" status="Now Live" title="GitHub Continuous Workspaces" desc="Push updates automatically with production build maps." />
            <RoadmapCard step="02" status="Q3 2026" title="AI Error Analysis" desc="Instant intelligent debugging recommendations on pipeline breakages." />
            <RoadmapCard step="03" status="Q3 2026" title="Incident Alerts" desc="Immediate diagnostic telemetry pings routed straight to your communication webhooks." />
            <RoadmapCard step="04" status="Q4 2026" title="Metrics Monitoring" desc="Advanced real-time server tracking directly inside the terminal viewer." />
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
                <li>Unlimited project layouts</li>
                <li>Shared workspace organization</li>
                <li>Basic repository connection tracking</li>
                <li>Real-time build status updates</li>
              </ul>
            </div>

            {/* PRO TIER */}
            <div style={{ flex: 1, minWidth: 280, background: "rgba(99,102,241,0.05)", border: "2px solid #6366f1", borderRadius: 16, padding: 32, position: "relative" }}>
              <span style={{ position: "absolute", top: 16, right: 16, background: "#6366f1", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>COMING SOON</span>
              <h3 style={{ fontSize: 20, margin: 0, color: "#a5b4fc" }}>Pro SaaS</h3>
              <div style={{ fontSize: 36, fontWeight: 800, margin: "16px 0" }}>$5<span style={{ fontSize: 14, color: "#64748b" }}>/mo</span></div>
              <ul style={{ paddingLeft: 20, color: "#cbd5e1", lineHeight: 2 }}>
                <li>Everything in the Free plan</li>
                <li>Advanced server log tracking</li>
                <li>AI Deployment troubleshooting analyzer</li>
                <li>Priority operational stack support</li>
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
              Take Command of Your Launch Ops Today
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
              Build Workspace for Free
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
          © {new Date().getFullYear()} LaunchAlly. Dedicated to streamlined operational clarity.
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

function RoadmapCard({ step, status, title, desc }) {
  return (
    <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)", padding: 24, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>{step}</span>
        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 4, color: "#cbd5e1" }}>{status}</span>
      </div>
      <h4 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}