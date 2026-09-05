import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/logo.png";
import demoVideo from "../assets/DeployAlly.mp4";

export default function Landing() {
  const [showVideo, setShowVideo] = useState(false);
  const [repo, setRepo] = useState("");

  const handleDemo = () => {
    if (!repo.trim()) return;
    setRepo("github.com/yourname/your-app");
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 50% -10%, rgba(99,102,241,.22), transparent 38%), #070b16",
          color: "#f8fafc",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          overflowX: "hidden",
        }}
      >
        {/* =========================================================
            NAVBAR
        ========================================================= */}

        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            borderBottom: "1px solid rgba(255,255,255,.07)",
            background: "rgba(7,11,22,.78)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "white",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <img
                src={logo}
                alt="LaunchAlly"
                style={{
                  width: 34,
                  height: 34,
                  objectFit: "contain",
                }}
              />

              <span
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: "-.5px",
                }}
              >
                LaunchAlly
              </span>
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <a
                href="#how-it-works"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                How it works
              </a>

              <a
                href="#intelligence"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Intelligence
              </a>

              <a
                href="#pricing"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Pricing
              </a>

              <Link
                to="/login"
                style={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  background: "#6366f1",
                  color: "white",
                  textDecoration: "none",
                  padding: "9px 16px",
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: "0 8px 25px rgba(99,102,241,.25)",
                }}
              >
                Start free
              </Link>
            </div>
          </div>
        </nav>

        <main>

          {/* =========================================================
              HERO
          ========================================================= */}

          <section
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "95px 20px 90px",
            }}
          >
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 13px",
                  borderRadius: 999,
                  border: "1px solid rgba(99,102,241,.28)",
                  background: "rgba(99,102,241,.09)",
                  color: "#a5b4fc",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 25,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 12px rgba(34,197,94,.7)",
                  }}
                />

                GitHub → Analyze → Deploy → Live
              </div>

              <h1
                style={{
                  fontSize: "clamp(46px, 7vw, 82px)",
                  lineHeight: 1.01,
                  letterSpacing: "-4.5px",
                  margin: "0 auto 26px",
                  fontWeight: 850,
                }}
              >
                From GitHub repository
                <br />

                <span
                  style={{
                    background:
                      "linear-gradient(90deg,#818cf8,#c4b5fd,#818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  to live application.
                </span>
              </h1>

              <p
                style={{
                  maxWidth: 720,
                  margin: "0 auto",
                  color: "#94a3b8",
                  fontSize: 19,
                  lineHeight: 1.75,
                }}
              >
                LaunchAlly understands your repository, detects how it should
                run, configures the deployment, and gets your application
                online without the DevOps rabbit hole.
              </p>

              {/* HERO INPUT */}

              <div
                style={{
                  maxWidth: 740,
                  margin: "40px auto 18px",
                  padding: 7,
                  display: "flex",
                  gap: 8,
                  background: "rgba(15,23,42,.92)",
                  border: "1px solid rgba(255,255,255,.11)",
                  borderRadius: 14,
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,.4), 0 0 50px rgba(99,102,241,.08)",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#6366f1",
                      marginRight: 10,
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    $
                  </span>

                  <input
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleDemo();
                    }}
                    placeholder="Paste your GitHub repository"
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "white",
                      fontSize: 15,
                    }}
                  />
                </div>

                <Link
                  to="/register"
                  style={{
                    background: "#6366f1",
                    color: "white",
                    textDecoration: "none",
                    padding: "13px 21px",
                    borderRadius: 9,
                    fontWeight: 750,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    boxShadow: "0 8px 25px rgba(99,102,241,.28)",
                  }}
                >
                  Deploy my app
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 22,
                  flexWrap: "wrap",
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                <span>✓ Free to start</span>
                <span>✓ GitHub connected</span>
                <span>✓ Automatic analysis</span>
                <span>✓ No server setup</span>
              </div>
            </div>

            {/* =====================================================
                DEPLOYMENT PIPELINE
            ===================================================== */}

            <div
              style={{
                maxWidth: 1050,
                margin: "65px auto 0",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: 10,
              }}
            >
              <PipelineStep
                icon="⌘"
                label="GitHub"
                title="Connect"
                text="Choose your repository."
              />

              <PipelineConnector />

              <PipelineStep
                icon="◈"
                label="Analyzer"
                title="Understand"
                text="Detect your stack."
              />

              <PipelineConnector />

              <PipelineStep
                icon="⚙"
                label="LaunchAlly"
                title="Configure"
                text="Prepare deployment."
              />

              <PipelineConnector />

              <PipelineStep
                icon="↗"
                label="Production"
                title="Go live"
                text="Get your live URL."
              />
            </div>

            {/* =====================================================
                TERMINAL
            ===================================================== */}

            <div
              style={{
                maxWidth: 1050,
                margin: "35px auto 0",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,.09)",
                background: "#05070d",
                overflow: "hidden",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,.55), 0 0 80px rgba(99,102,241,.06)",
              }}
            >
              <div
                style={{
                  height: 46,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "0 16px",
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                  background: "#0b1020",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#f59e0b",
                  }}
                />
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />

                <span
                  style={{
                    marginLeft: 14,
                    color: "#64748b",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                >
                  launchally deploy
                </span>
              </div>

              <div
                style={{
                  padding: "27px 30px",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 13,
                  lineHeight: 2,
                  color: "#94a3b8",
                }}
              >
                <TerminalLine command="launchally deploy github.com/yourname/my-app" />

                <TerminalLine
                  text="✓ Repository connected"
                  good
                />

                <TerminalLine
                  text="✓ Framework detected: Next.js"
                  good
                />

                <TerminalLine
                  text="✓ Runtime detected: Node.js"
                  good
                />

                <TerminalLine
                  text="✓ Dependencies analyzed"
                  good
                />

                <TerminalLine
                  text="✓ Deployment configuration generated"
                  good
                />

                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,.06)",
                    margin: "10px 0",
                  }}
                />

                <TerminalLine
                  text="🚀 Application deployed successfully"
                  highlight
                />

                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 13px",
                    borderRadius: 8,
                    background: "rgba(99,102,241,.08)",
                    border: "1px solid rgba(99,102,241,.12)",
                    color: "#a5b4fc",
                  }}
                >
                  https://my-app.launchally.app
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              PROOF / AUDIENCE
          ========================================================= */}

          <section
            style={{
              borderTop: "1px solid rgba(255,255,255,.06)",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              background: "rgba(15,23,42,.38)",
            }}
          >
            <div
              style={{
                maxWidth: 1050,
                margin: "0 auto",
                padding: "28px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 30,
                flexWrap: "wrap",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              <strong style={{ color: "#94a3b8" }}>
                BUILT TO SHIP
              </strong>

              <span>Indie hackers</span>
              <span>SaaS founders</span>
              <span>Students</span>
              <span>Freelancers</span>
              <span>Small teams</span>
            </div>
          </section>

          {/* =========================================================
              THE PROBLEM
          ========================================================= */}

          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "115px 20px 95px",
            }}
          >
            <SectionLabel>THE DEPLOYMENT PROBLEM</SectionLabel>

            <h2
              style={{
                fontSize: "clamp(34px,5vw,54px)",
                lineHeight: 1.06,
                letterSpacing: "-2.5px",
                maxWidth: 820,
                margin: "13px 0 22px",
              }}
            >
              You built the application.
              <br />
              <span style={{ color: "#818cf8" }}>
                Deployment shouldn't become another project.
              </span>
            </h2>

            <p
              style={{
                maxWidth: 720,
                color: "#94a3b8",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Repositories, runtimes, package managers, build commands,
              environment variables, deployment settings and cryptic logs
              shouldn't stand between you and your next production URL.
            </p>

            <div
              style={{
                marginTop: 45,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: 14,
              }}
            >
              <ProblemCard
                number="01"
                title="Configuration rabbit holes"
                text="Stop searching documentation just to figure out how your project should be built."
              />

              <ProblemCard
                number="02"
                title="Deployment guesswork"
                text="Know what LaunchAlly detected before you press deploy."
              />

              <ProblemCard
                number="03"
                title="Unreadable failures"
                text="Turn deployment output into information you can actually act on."
              />
            </div>
          </section>

          {/* =========================================================
              HOW IT WORKS
          ========================================================= */}

          <section
            id="how-it-works"
            style={{
              padding: "100px 20px 115px",
              background:
                "linear-gradient(180deg, rgba(15,23,42,.3), rgba(15,23,42,.65))",
              borderTop: "1px solid rgba(255,255,255,.05)",
              borderBottom: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 60,
                }}
              >
                <SectionLabel>HOW IT WORKS</SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(34px,5vw,50px)",
                    letterSpacing: "-2px",
                    margin: "12px 0 15px",
                  }}
                >
                  GitHub to live app.
                  <br />
                  <span style={{ color: "#818cf8" }}>
                    Four steps.
                  </span>
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    maxWidth: 650,
                    margin: "0 auto",
                    lineHeight: 1.75,
                  }}
                >
                  LaunchAlly handles the deployment workflow so you can stay
                  focused on the product instead of infrastructure.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 16,
                }}
              >
                <BigStep
                  number="01"
                  title="Connect GitHub"
                  text="Choose the repository containing the application you want to ship."
                />

                <BigStep
                  number="02"
                  title="We understand it"
                  text="LaunchAlly analyzes the repository and detects its framework, runtime and deployment path."
                />

                <BigStep
                  number="03"
                  title="Configure & deploy"
                  text="Set your environment variables and launch the application from your workspace."
                />

                <BigStep
                  number="04"
                  title="Go live"
                  text="Receive a production URL and monitor the deployment from your dashboard."
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              ANALYZER
          ========================================================= */}

          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "115px 20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(320px,1fr))",
                gap: 60,
                alignItems: "center",
              }}
            >
              <div>
                <SectionLabel>
                  SMART REPOSITORY ANALYSIS
                </SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(34px,4vw,48px)",
                    lineHeight: 1.08,
                    letterSpacing: "-2px",
                    margin: "13px 0 20px",
                  }}
                >
                  Don't know what your project needs?
                  <br />

                  <span style={{ color: "#818cf8" }}>
                    LaunchAlly figures it out.
                  </span>
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 16,
                    lineHeight: 1.8,
                  }}
                >
                  Before deployment, LaunchAlly looks at the repository and
                  determines what it is, how it should run and whether the
                  project is ready to deploy.
                </p>

                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    "Next.js",
                    "React",
                    "Vite",
                    "Node.js",
                    "FastAPI",
                    "Flask",
                    "Django",
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: "rgba(99,102,241,.08)",
                        border:
                          "1px solid rgba(99,102,241,.16)",
                        color: "#a5b4fc",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "#070b16",
                  border:
                    "1px solid rgba(255,255,255,.09)",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow:
                    "0 25px 70px rgba(0,0,0,.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 750,
                    }}
                  >
                    Repository analysis
                  </span>

                  <span
                    style={{
                      color: "#818cf8",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    ANALYZER V4
                  </span>
                </div>

                <AnalysisLine
                  label="Repository"
                  value="my-saas-app"
                />

                <AnalysisLine
                  label="Framework"
                  value="Next.js"
                  good
                />

                <AnalysisLine
                  label="Runtime"
                  value="Node.js"
                  good
                />

                <AnalysisLine
                  label="Package manager"
                  value="npm"
                  good
                />

                <AnalysisLine
                  label="Deployment strategy"
                  value="Vercel"
                  good
                />

                <div
                  style={{
                    marginTop: 18,
                    padding: 13,
                    borderRadius: 9,
                    background:
                      "rgba(34,197,94,.07)",
                    border:
                      "1px solid rgba(34,197,94,.12)",
                    color: "#86efac",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ✓ Repository is ready to deploy
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              DEPLOYMENT INTELLIGENCE
          ========================================================= */}

          <section
            id="intelligence"
            style={{
              padding: "105px 20px 115px",
              background:
                "linear-gradient(180deg, rgba(15,23,42,.35), rgba(7,11,22,.95))",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                maxWidth: 1050,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  maxWidth: 750,
                  marginBottom: 50,
                }}
              >
                <SectionLabel>
                  DEPLOYMENT INTELLIGENCE
                </SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(34px,5vw,50px)",
                    lineHeight: 1.07,
                    letterSpacing: "-2px",
                    margin: "13px 0 18px",
                  }}
                >
                  Deployment logs shouldn't
                  <br />
                  <span style={{ color: "#818cf8" }}>
                    leave you guessing.
                  </span>
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 16,
                    lineHeight: 1.8,
                  }}
                >
                  LaunchAlly's direction is simple: don't just show developers
                  that something failed. Help them understand what happened
                  and what to do next.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(300px,1fr))",
                  gap: 18,
                }}
              >
                <IntelligenceCard
                  icon="⌁"
                  title="Understand failures"
                  text="Surface the important part of a deployment failure instead of forcing developers to dig through hundreds of lines of output."
                />

                <IntelligenceCard
                  icon="◈"
                  title="Know your stack"
                  text="Keep framework, runtime, package manager and deployment information visible inside the project workflow."
                />

                <IntelligenceCard
                  icon="↻"
                  title="Get back online"
                  text="The goal isn't another error log. It's a clear path from failed deployment to successful deployment."
                />
              </div>

              {/* AI TROUBLESHOOTING MOCKUP */}

              <div
                style={{
                  marginTop: 35,
                  borderRadius: 18,
                  border:
                    "1px solid rgba(255,255,255,.09)",
                  background: "#070b16",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "15px 18px",
                    borderBottom:
                      "1px solid rgba(255,255,255,.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 15,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 750,
                      fontSize: 13,
                    }}
                  >
                    Deployment intelligence
                  </span>

                  <span
                    style={{
                      color: "#a5b4fc",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".7px",
                    }}
                  >
                    LAUNCHALLY AI
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(280px,1fr))",
                  }}
                >
                  <div
                    style={{
                      padding: 24,
                      borderRight:
                        "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: 11,
                        fontWeight: 800,
                        marginBottom: 12,
                      }}
                    >
                      DEPLOYMENT FAILED
                    </div>

                    <div
                      style={{
                        color: "#cbd5e1",
                        fontFamily: "monospace",
                        fontSize: 12,
                        lineHeight: 1.8,
                      }}
                    >
                      ModuleNotFoundError:
                      <br />
                      No module named 'fastapi'
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        color: "#a5b4fc",
                        fontSize: 11,
                        fontWeight: 800,
                        marginBottom: 12,
                      }}
                    >
                      WHAT'S WRONG?
                    </div>

                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: 13,
                        lineHeight: 1.7,
                        margin: "0 0 15px",
                      }}
                    >
                      Your application imports FastAPI, but the dependency
                      could not be found during the deployment.
                    </p>

                    <div
                      style={{
                        padding: 12,
                        borderRadius: 9,
                        background:
                          "rgba(99,102,241,.08)",
                        border:
                          "1px solid rgba(99,102,241,.14)",
                        color: "#a5b4fc",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Suggested fix → add the missing dependency and
                      redeploy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              FEATURES
          ========================================================= */}

          <section
            style={{
              padding: "105px 20px",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                maxWidth: 1050,
                margin: "0 auto",
              }}
            >
              <div style={{ marginBottom: 48 }}>
                <SectionLabel>
                  ONE WORKSPACE
                </SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(34px,5vw,50px)",
                    letterSpacing: "-2px",
                    margin: "13px 0",
                  }}
                >
                  Everything after{" "}
                  <span style={{ color: "#818cf8" }}>
                    git push.
                  </span>
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    maxWidth: 650,
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  Your deployment workflow, project configuration and team
                  collaboration in one place.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 16,
                }}
              >
                <Feature
                  number="01"
                  title="Deployments"
                  text="Launch projects from GitHub and see exactly what is happening."
                />

                <Feature
                  number="02"
                  title="Repository analysis"
                  text="Understand your framework, runtime, package manager and deployment path."
                />

                <Feature
                  number="03"
                  title="Environment variables"
                  text="Configure application secrets without scattering configuration across tools."
                />

                <Feature
                  number="04"
                  title="Teams"
                  text="Invite teammates and keep projects organized inside shared workspaces."
                />

                <Feature
                  number="05"
                  title="Deployment insights"
                  text="See deployment status, logs and live URLs from one dashboard."
                />

                <Feature
                  number="06"
                  title="Production workflow"
                  text="Move from repository to production without managing infrastructure manually."
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              FUTURE WORKFLOW
          ========================================================= */}

          <section
            style={{
              padding: "105px 20px",
              background:
                "rgba(15,23,42,.35)",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                maxWidth: 1050,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(320px,1fr))",
                  gap: 60,
                  alignItems: "center",
                }}
              >
                <div>
                  <SectionLabel>
                    WHERE WE'RE GOING
                  </SectionLabel>

                  <h2
                    style={{
                      fontSize: "clamp(34px,5vw,48px)",
                      lineHeight: 1.08,
                      letterSpacing: "-2px",
                      margin: "13px 0 20px",
                    }}
                  >
                    Your deployment platform
                    <br />
                    <span style={{ color: "#818cf8" }}>
                      should understand your app.
                    </span>
                  </h2>

                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 16,
                      lineHeight: 1.8,
                    }}
                  >
                    LaunchAlly is being built toward a workflow where
                    deployment isn't the end of the process. It's the
                    beginning of understanding, monitoring and improving your
                    application.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <FutureCard
                    number="01"
                    title="Preview environments"
                    text="Push a branch. Get a shareable preview URL."
                  />

                  <FutureCard
                    number="02"
                    title="AI deployment troubleshooting"
                    text="Turn confusing deployment errors into actionable explanations."
                  />

                  <FutureCard
                    number="03"
                    title="Team feedback"
                    text="Let teams review deployments and connect feedback back to the workflow."
                  />

                  <FutureCard
                    number="04"
                    title="Smarter operations"
                    text="Move from raw infrastructure output toward application-aware deployment intelligence."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              INTEGRATIONS
          ========================================================= */}

          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "105px 20px",
              textAlign: "center",
            }}
          >
            <SectionLabel>
              YOUR EXISTING WORKFLOW
            </SectionLabel>

            <h2
              style={{
                fontSize: "clamp(34px,5vw,48px)",
                letterSpacing: "-2px",
                margin: "13px 0 16px",
              }}
            >
              Bring the tools you already use.
            </h2>

            <p
              style={{
                color: "#94a3b8",
                maxWidth: 650,
                margin: "0 auto 45px",
                lineHeight: 1.75,
              }}
            >
              LaunchAlly fits around the workflow you already have instead of
              forcing you to rebuild it.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(190px,1fr))",
                gap: 14,
                textAlign: "left",
              }}
            >
              <IntegrationCard
                icon="⌘"
                title="GitHub"
                text="Your source of truth."
              />

              <IntegrationCard
                icon="◈"
                title="LaunchAlly Analyzer"
                text="Understand your repository."
              />

              <IntegrationCard
                icon="👥"
                title="Team workspaces"
                text="Build together."
              />

              <IntegrationCard
                icon="↗"
                title="Live deployments"
                text="Ship to production."
              />
            </div>
          </section>

          {/* =========================================================
              VIDEO
          ========================================================= */}

          <section
            style={{
              padding: "105px 20px",
              background:
                "linear-gradient(180deg, rgba(15,23,42,.25), rgba(7,11,22,.8))",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <SectionLabel>
                SEE IT IN ACTION
              </SectionLabel>

              <h2
                style={{
                  fontSize: "clamp(34px,5vw,50px)",
                  letterSpacing: "-2px",
                  margin: "13px 0 18px",
                }}
              >
                Watch a repository go live.
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  maxWidth: 620,
                  margin: "0 auto 30px",
                  lineHeight: 1.75,
                }}
              >
                No slides. No fake dashboard. See how LaunchAlly actually
                handles the deployment workflow.
              </p>

              <button
                onClick={() => setShowVideo(true)}
                style={{
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "#111827",
                  color: "white",
                  padding: "15px 24px",
                  borderRadius: 10,
                  fontWeight: 750,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                ▶ Watch the demo
              </button>
            </div>
          </section>

          {/* =========================================================
              PRICING
          ========================================================= */}

          <section
            id="pricing"
            style={{
              padding: "105px 20px",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
              background:
                "rgba(15,23,42,.35)",
            }}
          >
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <SectionLabel>
                PRICING
              </SectionLabel>

              <h2
                style={{
                  fontSize: "clamp(34px,5vw,50px)",
                  letterSpacing: "-2px",
                  margin: "13px 0",
                }}
              >
                Start free.
                <br />
                <span style={{ color: "#818cf8" }}>
                  Upgrade when you need more.
                </span>
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  marginBottom: 45,
                  lineHeight: 1.7,
                }}
              >
                Build first. Pay when LaunchAlly becomes part of your
                workflow.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(280px,1fr))",
                  gap: 18,
                  textAlign: "left",
                }}
              >
                <PriceCard
                  title="Free"
                  price="$0"
                  text="Everything you need to try LaunchAlly and ship your first projects."
                  items={[
                    "1 project",
                    "Up to 5 deployments",
                    "Team workspace",
                    "Up to 3 team members",
                    "Deployment logs",
                    "Repository analysis",
                  ]}
                />

                <PriceCard
                  title="Pro"
                  price="$5"
                  highlighted
                  text="For builders ready to ship without the basic limits."
                  items={[
                    "Unlimited projects",
                    "Unlimited deployments",
                    "Unlimited team members",
                    "Team collaboration",
                    "Advanced deployment insights",
                    "AI-powered debugging direction",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              FINAL CTA
          ========================================================= */}

          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "115px 20px 110px",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
                borderRadius: 24,
                padding: "80px 25px",
                border:
                  "1px solid rgba(129,140,248,.2)",
                background:
                  "radial-gradient(circle at 50% 0%, rgba(99,102,241,.22), transparent 55%), #0c1222",
                boxShadow:
                  "0 30px 100px rgba(0,0,0,.35)",
              }}
            >
              <div
                style={{
                  color: "#a5b4fc",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  marginBottom: 16,
                }}
              >
                YOUR NEXT DEPLOYMENT
              </div>

              <h2
                style={{
                  fontSize: "clamp(36px,5vw,60px)",
                  lineHeight: 1.04,
                  letterSpacing: "-2.8px",
                  margin: "0 0 18px",
                }}
              >
                Stop preparing to deploy.
                <br />

                <span style={{ color: "#818cf8" }}>
                  Just ship it.
                </span>
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  maxWidth: 610,
                  margin: "0 auto 32px",
                  lineHeight: 1.75,
                }}
              >
                Connect your repository, let LaunchAlly understand it, and
                get your application online.
              </p>

              <Link
                to="/register"
                style={{
                  display: "inline-block",
                  background: "#6366f1",
                  color: "white",
                  textDecoration: "none",
                  padding: "15px 26px",
                  borderRadius: 10,
                  fontWeight: 800,
                  boxShadow:
                    "0 12px 35px rgba(99,102,241,.3)",
                }}
              >
                Deploy my first project →
              </Link>
            </div>
          </section>
        </main>

        {/* =========================================================
            FOOTER
        ========================================================= */}

        <footer
          style={{
            borderTop:
              "1px solid rgba(255,255,255,.06)",
            padding: "35px 20px",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <div
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <span>
              © {new Date().getFullYear()} LaunchAlly
            </span>

            <span>
              Ship software without becoming a DevOps engineer.
            </span>
          </div>
        </footer>
      </div>

      {/* =========================================================
          VIDEO MODAL
      ========================================================= */}

      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(2,6,23,.94)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowVideo(false)}
              style={{
                position: "absolute",
                right: 0,
                top: -48,
                border: "none",
                background: "transparent",
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
                borderRadius: 16,
                background: "black",
                border:
                  "1px solid rgba(255,255,255,.1)",
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

/* ================================================================
   SMALL COMPONENTS
================================================================ */

function SectionLabel({ children }) {
  return (
    <div
      style={{
        color: "#818cf8",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "1.5px",
      }}
    >
      {children}
    </div>
  );
}

function PipelineStep({ icon, label, title, text }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "rgba(7,11,22,.7)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(99,102,241,.1)",
          border:
            "1px solid rgba(99,102,241,.15)",
          color: "#a5b4fc",
          fontWeight: 800,
          marginBottom: 15,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".8px",
          marginBottom: 5,
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          fontWeight: 800,
          fontSize: 16,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function PipelineConnector() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6366f1",
        fontSize: 20,
        opacity: 0.65,
      }}
    >
      →
    </div>
  );
}

function TerminalLine({ command, text, good, highlight }) {
  return (
    <div
      style={{
        color: highlight
          ? "#86efac"
          : good
          ? "#94a3b8"
          : "#cbd5e1",
      }}
    >
      {command ? (
        <>
          <span
            style={{
              color: "#6366f1",
              marginRight: 9,
            }}
          >
            $
          </span>
          {command}
        </>
      ) : (
        text
      )}
    </div>
  );
}

function ProblemCard({ number, title, text }) {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 15,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "#090e1b",
      }}
    >
      <div
        style={{
          color: "#6366f1",
          fontSize: 11,
          fontWeight: 800,
          marginBottom: 18,
        }}
      >
        {number}
      </div>

      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 17,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.65,
          margin: 0,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function BigStep({ number, title, text }) {
  return (
    <div
      style={{
        padding: 25,
        borderRadius: 15,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "rgba(7,11,22,.65)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "rgba(99,102,241,.09)",
          border:
            "1px solid rgba(99,102,241,.14)",
          color: "#818cf8",
          fontSize: 11,
          fontWeight: 800,
          marginBottom: 22,
        }}
      >
        {number}
      </div>

      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.65,
          margin: 0,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function AnalysisItem({ label, value }) {
  return (
    <div
      style={{
        padding: 11,
        borderRadius: 9,
        background: "#0c1222",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          marginBottom: 5,
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          color: "#e2e8f0",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AnalysisLine({ label, value, good }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: "11px 0",
        borderBottom:
          "1px solid rgba(255,255,255,.05)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#64748b" }}>
        {label}
      </span>

      <span
        style={{
          color: good
            ? "#a5b4fc"
            : "#e2e8f0",
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IntelligenceCard({
  icon,
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: 25,
        borderRadius: 15,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "#090e1b",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "rgba(99,102,241,.1)",
          border:
            "1px solid rgba(99,102,241,.15)",
          color: "#a5b4fc",
          fontWeight: 800,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.7,
          margin: 0,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function Feature({ number, title, text }) {
  return (
    <div
      style={{
        padding: 26,
        borderRadius: 15,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "#090e1b",
      }}
    >
      <div
        style={{
          color: "#6366f1",
          fontSize: 11,
          fontWeight: 800,
          marginBottom: 18,
        }}
      >
        {number}
      </div>

      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.65,
          margin: 0,
          fontSize: 14,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function FutureCard({
  number,
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 13,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "#090e1b",
        display: "flex",
        gap: 15,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          color: "#6366f1",
          fontSize: 11,
          fontWeight: 800,
          paddingTop: 2,
          minWidth: 24,
        }}
      >
        {number}
      </div>

      <div>
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 15,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            color: "#64748b",
            margin: 0,
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function IntegrationCard({
  icon,
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 14,
        border:
          "1px solid rgba(255,255,255,.07)",
        background: "#090e1b",
      }}
    >
      <div
        style={{
          fontSize: 21,
          marginBottom: 14,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontWeight: 800,
          fontSize: 15,
          marginBottom: 5,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: 12,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function PriceCard({
  title,
  price,
  text,
  items,
  highlighted,
}) {
  return (
    <div
      style={{
        position: "relative",
        padding: 28,
        borderRadius: 16,
        border: highlighted
          ? "1px solid rgba(129,140,248,.6)"
          : "1px solid rgba(255,255,255,.08)",
        background: highlighted
          ? "rgba(99,102,241,.08)"
          : "#090e1b",
        boxShadow: highlighted
          ? "0 20px 60px rgba(99,102,241,.1)"
          : "none",
      }}
    >
      {highlighted && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#a5b4fc",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".5px",
          }}
        >
          MOST POPULAR
        </div>
      )}

      <div
        style={{
          color: highlighted
            ? "#a5b4fc"
            : "#cbd5e1",
          fontWeight: 750,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 40,
          fontWeight: 850,
          letterSpacing: "-2px",
        }}
      >
        {price}

        {price !== "$0" && (
          <span
            style={{
              color: "#64748b",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            /month
          </span>
        )}
      </div>

      <p
        style={{
          color: "#64748b",
          fontSize: 13,
          lineHeight: 1.6,
          minHeight: 42,
        }}
      >
        {text}
      </p>

      <div
        style={{
          borderTop:
            "1px solid rgba(255,255,255,.06)",
          paddingTop: 18,
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            style={{
              color: "#cbd5e1",
              fontSize: 13,
              marginBottom: 11,
            }}
          >
            <span
              style={{
                color: "#4ade80",
                marginRight: 8,
              }}
            >
              ✓
            </span>

            {item}
          </div>
        ))}
      </div>
    </div>
  );
}