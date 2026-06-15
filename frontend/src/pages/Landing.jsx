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
          background:
            "radial-gradient(circle at top right, rgba(99,102,241,0.18), transparent 30%), #0f172a",
          color: "white",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.75)",
          }}
        >
          {/* LOGO */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={logo}
              alt="LaunchAlly Logo"
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
              }}
            />

            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              LaunchAlly
            </h1>
          </div>

          {/* NAV LINKS */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
            }}
          >
            <Link
              to="/login"
              style={{
                color: "white",
                textDecoration: "none",
                opacity: 0.85,
                transition: "0.25s ease",
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                background: "#6366f1",
                padding: "12px 18px",
                borderRadius: 10,
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
                transition: "0.25s ease",
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
            padding: "80px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(99,102,241,0.15)",
                color: "#a5b4fc",
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 14,
                marginBottom: 24,
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              Beginner-Friendly DevOps Platform
            </div>

            <h1
              style={{
                fontSize: "clamp(42px, 8vw, 72px)",
                lineHeight: 1,
                marginBottom: 24,
                fontWeight: 900,
                letterSpacing: -2,
                maxWidth: 700,
              }}
            >
              Launch applications, manage deployments, and collaborate with your team — all from one dashboard.
            </h1>

            <p
              style={{
                fontSize: "clamp(16px, 3vw, 20px)",
                lineHeight: 1.8,
                color: "#cbd5e1",
                maxWidth: 650,
                marginBottom: 40,
              }}
            >
              LaunchAlly helps developers and small teams launch applications, 
              manage projects, monitor deployments, and collaborate from a single workspace.
            </p>

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register"
                style={{
                  background: "#6366f1",
                  padding: "16px 26px",
                  borderRadius: 12,
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 15px 35px rgba(99,102,241,0.35)",
                  transition: "0.25s ease",
                }}
              >
                Start Free
              </Link>

              <button
                onClick={() => setShowVideo(true)}
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "16px 24px",
                  borderRadius: 12,
                  color: "white",
                  background: "rgba(255,255,255,0.03)",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "0.25s ease",
                  backdropFilter: "blur(8px)",
                }}
              >
                ▶ Watch Demo
              </button>
            </div>

            {/* TRUST TEXT */}
            <div
              style={{
                marginTop: 30,
                color: "#94a3b8",
                fontSize: 15,
              }}
            >
              Launch applications, manage projects, and collaborate with your team — all from one dashboard.
            </div>
          </div>

          {/* RIGHT SIDE CARD */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              background: "rgba(17,24,39,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 30,
              boxShadow:
                "0 25px 100px rgba(0,0,0,0.45), 0 0 80px rgba(99,102,241,0.15)",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* GLOW */}
            <div
              style={{
                position: "absolute",
                width: 300,
                height: 300,
                background: "rgba(99,102,241,0.15)",
                filter: "blur(100px)",
                top: -120,
                right: -120,
                borderRadius: "50%",
              }}
            />

            {/* TOP BAR */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />

              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />

              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
            </div>

            {/* DEPLOYMENT UI MOCKUP */}
            <div
              style={{
                background: "#0f172a",
                padding: 22,
                borderRadius: 18,
                marginBottom: 18,
                border: "1px solid rgba(255,255,255,0.05)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 12,
                  fontSize: 18,
                }}
              >
                Production Deployment
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  marginBottom: 16,
                }}
              >
                launchally-api • main branch
              </div>

              <div
                style={{
                  height: 10,
                  background: "#1e293b",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "82%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 0 25px rgba(99,102,241,0.5)",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: "#10b981",
                  fontWeight: 600,
                }}
              >
                Deployment successful
              </div>
            </div>

            {/* STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                position: "relative",
                zIndex: 2,
              }}
            >
              <StatCard title="GitHub Integration" value="✓" />
              <StatCard title="Team Workspaces" value="✓" />
              <StatCard title="Deployments" value="✓" />
              <StatCard title="Monitoring" value="✓" />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              marginBottom: 18,
              textAlign: "center",
              fontWeight: 800,
            }}
          >
            Everything your DevOps workflow needs
          </h2>

          <p
            style={{
              color: "#94a3b8",
              textAlign: "center",
              fontSize: "clamp(16px, 3vw, 18px)",
              marginBottom: 60,
            }}
          >
            Simple enough for beginners. Powerful enough for growing teams.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            <FeatureCard
              title="One-click Deployments"
              text="Deploy applications instantly with streamlined workflows."
            />

            <FeatureCard
              title="Real-time Monitoring"
              text="Track deployment health and project performance live."
            />

            <FeatureCard
              title="Team Collaboration"
              text="Invite teammates and manage projects together."
            />

            <FeatureCard
              title="Simple Project Management"
              text="Organize deployments and infrastructure from one dashboard."
            />
          </div>
        </section>

        {/* CTA SECTION */}
        <section
          style={{
            maxWidth: 1200,
            margin: "80px auto 0",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 30,
              padding: "60px 30px",
              textAlign: "center",
              backdropFilter: "blur(14px)",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(34px, 6vw, 54px)",
                marginBottom: 20,
                fontWeight: 800,
              }}
            >
              Ready to simplify deployments?
            </h2>

            <p
              style={{
                color: "#cbd5e1",
                maxWidth: 700,
                margin: "0 auto 35px",
                lineHeight: 1.8,
                fontSize: 18,
              }}
            >
              Join developers building and managing applications
              with a cleaner, more beginner-friendly DevOps workflow.
            </p>

            <Link
              to="/register"
              style={{
                display: "inline-block",
                background: "#6366f1",
                padding: "18px 30px",
                borderRadius: 14,
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 17,
                boxShadow: "0 15px 40px rgba(99,102,241,0.35)",
              }}
            >
              Create Free Account
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: 80,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "24px 20px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          © {new Date().getFullYear()} LaunchAlly. All rights reserved.
        </footer>
      </div>

      {/* VIDEO MODAL */}
      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 20,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 1100,
              position: "relative",
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowVideo(false)}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: 32,
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
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "black",
                boxShadow: "0 30px 100px rgba(0,0,0,0.5)",
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

function FeatureCard({ title, text }) {
  return (
    <div
      style={{
        background: "rgba(17,24,39,0.8)",
        padding: 28,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "0.25s ease",
        backdropFilter: "blur(10px)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "rgba(17,24,39,0.75)",
        padding: 20,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          marginBottom: 8,
          fontSize: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}