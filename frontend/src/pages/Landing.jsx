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
          background: "#0f172a",
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 60px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
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
              alt="DeployAlly Logo"
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
              }}
            >
              DeployAlly
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
            padding: "100px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60,
            flexWrap: "wrap",
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
              }}
            >
              Beginner-Friendly DevOps Platform
            </div>

            <h1
              style={{
                fontSize: 64,
                lineHeight: 1.05,
                marginBottom: 24,
                fontWeight: 800,
              }}
            >
              Deploy and manage apps without complicated DevOps workflows.
            </h1>

            <p
              style={{
                fontSize: 20,
                lineHeight: 1.7,
                color: "#cbd5e1",
                maxWidth: 650,
                marginBottom: 40,
              }}
            >
              DeployAlly gives developers and teams a clean,
              beginner-friendly workspace to manage deployments,
              monitor projects, collaborate with teammates and
              streamline DevOps — all from one modern dashboard.
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
                  padding: "16px 24px",
                  borderRadius: 12,
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 16,
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
                  background: "transparent",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* RIGHT SIDE CARD */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 30,
              boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
            }}
          >
            {/* TOP BAR */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
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
                deployally-api • main branch
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
                    background: "#6366f1",
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
              }}
            >
              <StatCard title="Deployments" value="1,284" />
              <StatCard title="Projects" value="48" />
              <StatCard title="Uptime" value="99.9%" />
              <StatCard title="Teams" value="12" />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px",
          }}
        >
          <h2
            style={{
              fontSize: 42,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Everything your DevOps workflow needs
          </h2>

          <p
            style={{
              color: "#94a3b8",
              textAlign: "center",
              fontSize: 18,
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

        {/* FOOTER */}
        <footer
          style={{
            marginTop: 80,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "30px 40px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          © {new Date().getFullYear()} DeployAlly. All rights reserved.
        </footer>
      </div>

      {/* VIDEO MODAL */}
      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 20,
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
                top: -50,
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
        background: "#111827",
        padding: 28,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 14,
          fontSize: 22,
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
        background: "#111827",
        padding: 20,
        borderRadius: 16,
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