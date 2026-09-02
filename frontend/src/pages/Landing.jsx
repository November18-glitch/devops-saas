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
        {/* NAVBAR */}
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

        {/* HERO */}
        <main>
          <section
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "90px 20px 70px",
            }}
          >
            <div
              style={{
                maxWidth: 850,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(99,102,241,.28)",
                  background: "rgba(99,102,241,.09)",
                  color: "#a5b4fc",
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 24,
                }}
              >
                <span>●</span>
                From GitHub repository to live application
              </div>

              <h1
                style={{
                  fontSize: "clamp(44px, 7vw, 76px)",
                  lineHeight: 1.02,
                  letterSpacing: "-4px",
                  margin: "0 auto 24px",
                  fontWeight: 850,
                }}
              >
                Your code is ready.
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg,#818cf8,#c4b5fd,#818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Now ship it.
                </span>
              </h1>

              <p
                style={{
                  maxWidth: 690,
                  margin: "0 auto",
                  color: "#94a3b8",
                  fontSize: 19,
                  lineHeight: 1.7,
                }}
              >
                Connect your GitHub repository. LaunchAlly analyzes your
                project, detects how it should run, and gets it deployed
                without making you become a DevOps engineer first.
              </p>

              {/* REPO INPUT */}
              <div
                style={{
                  maxWidth: 720,
                  margin: "38px auto 18px",
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
                      color: "#64748b",
                      marginRight: 10,
                      fontSize: 16,
                    }}
                  >
                    →
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
                    padding: "13px 20px",
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
                <span>✓ No server setup</span>
              </div>
            </div>

            {/* PRODUCT PREVIEW */}
            <div
              style={{
                maxWidth: 1020,
                margin: "70px auto 0",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,.1)",
                background: "rgba(15,23,42,.8)",
                boxShadow:
                  "0 40px 100px rgba(0,0,0,.55), 0 0 100px rgba(99,102,241,.08)",
                overflow: "hidden",
              }}
            >
              {/* browser top */}
              <div
                style={{
                  height: 46,
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  borderBottom: "1px solid rgba(255,255,255,.07)",
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

                <div
                  style={{
                    marginLeft: 14,
                    flex: 1,
                    maxWidth: 420,
                    marginRight: "auto",
                    marginLeft: "auto",
                    background: "#070b16",
                    borderRadius: 7,
                    padding: "6px 12px",
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  app.launchally.org/projects/my-app
                </div>
              </div>

              {/* dashboard */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "210px 1fr",
                  minHeight: 420,
                }}
              >
                <div
                  style={{
                    borderRight: "1px solid rgba(255,255,255,.06)",
                    padding: 20,
                    background: "#090e1b",
                  }}
                >
                  <div
                    style={{
                      color: "#6366f1",
                      fontWeight: 800,
                      marginBottom: 30,
                    }}
                  >
                    LaunchAlly
                  </div>

                  <PreviewNav active text="Projects" />
                  <PreviewNav text="Deployments" />
                  <PreviewNav text="Teams" />
                  <PreviewNav text="Settings" />
                </div>

                <div
                  style={{
                    padding: 28,
                    background:
                      "radial-gradient(circle at 80% 0%, rgba(99,102,241,.07), transparent 35%), #0b1020",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 12,
                          marginBottom: 5,
                        }}
                      >
                        PROJECT
                      </div>

                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                        }}
                      >
                        fastapi-vercel
                      </div>
                    </div>

                    <span
                      style={{
                        color: "#4ade80",
                        background: "rgba(34,197,94,.1)",
                        border: "1px solid rgba(34,197,94,.18)",
                        borderRadius: 999,
                        padding: "6px 11px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ● LIVE
                    </span>
                  </div>

                  {/* analyzer */}
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      background: "#070b16",
                      border: "1px solid rgba(255,255,255,.07)",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Repository analysis
                      </div>

                      <span
                        style={{
                          color: "#a5b4fc",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ANALYZER V4
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(120px,1fr))",
                        gap: 10,
                      }}
                    >
                      <AnalysisItem label="Framework" value="FastAPI" />
                      <AnalysisItem label="Runtime" value="Python" />
                      <AnalysisItem label="Package manager" value="pip" />
                      <AnalysisItem label="Confidence" value="High · 85%" />
                    </div>
                  </div>

                  {/* deployment */}
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      background: "#070b16",
                      border: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 11,
                        marginBottom: 8,
                      }}
                    >
                      DEPLOYMENT
                    </div>

                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        lineHeight: 1.9,
                        color: "#94a3b8",
                      }}
                    >
                      <div>✓ Repository connected</div>
                      <div>✓ Framework detected</div>
                      <div>✓ Dependencies installed</div>
                      <div>✓ Deployment created</div>

                      <div
                        style={{
                          color: "#4ade80",
                          marginTop: 6,
                        }}
                      >
                        ✓ Application is live
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 15,
                        padding: 12,
                        borderRadius: 9,
                        background: "rgba(99,102,241,.08)",
                        color: "#a5b4fc",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      https://fastapi-vercel.launchally.app
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* POSITIONING */}
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
                gap: 35,
                flexWrap: "wrap",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              <strong style={{ color: "#94a3b8" }}>
                BUILT FOR PEOPLE WHO JUST WANT TO SHIP
              </strong>

              <span>Indie hackers</span>
              <span>SaaS founders</span>
              <span>Students</span>
              <span>Freelancers</span>
              <span>Small teams</span>
            </div>
          </section>

          {/* THE PROBLEM */}
          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "110px 20px 80px",
            }}
          >
            <SectionLabel>THE PROBLEM</SectionLabel>

            <h2
              style={{
                fontSize: "clamp(32px,5vw,50px)",
                lineHeight: 1.08,
                letterSpacing: "-2px",
                maxWidth: 760,
                margin: "12px 0 20px",
              }}
            >
              You built the application.
              <br />
              Why should deployment become another project?
            </h2>

            <p
              style={{
                maxWidth: 700,
                color: "#94a3b8",
                fontSize: 17,
                lineHeight: 1.75,
              }}
            >
              GitHub repositories, build configuration, environment
              variables, deployment settings, logs, infrastructure and
              troubleshooting quickly turn a simple launch into a DevOps
              problem.
            </p>
          </section>

          {/* HOW IT WORKS */}
          <section
            id="how-it-works"
            style={{
              padding: "90px 20px 110px",
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
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <SectionLabel>HOW IT WORKS</SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(32px,5vw,48px)",
                    letterSpacing: "-2px",
                    margin: "12px 0 14px",
                  }}
                >
                  GitHub to live app.
                  <br />
                  Four steps.
                </h2>

                <p
                  style={{
                    color: "#94a3b8",
                    maxWidth: 620,
                    margin: "0 auto",
                    lineHeight: 1.7,
                  }}
                >
                  LaunchAlly handles the boring deployment work so you can
                  spend your time building the product.
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
                  title="We analyze it"
                  text="LaunchAlly detects the framework, runtime, package manager and deployment path."
                />

                <BigStep
                  number="03"
                  title="Deploy"
                  text="Configure your environment variables and launch the application."
                />

                <BigStep
                  number="04"
                  title="Go live"
                  text="Get a production URL you can open, test and share."
                />
              </div>
            </div>
          </section>

          {/* ANALYZER */}
          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "110px 20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 55,
                alignItems: "center",
              }}
            >
              <div>
                <SectionLabel>SMART REPOSITORY ANALYSIS</SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(32px,4vw,46px)",
                    lineHeight: 1.08,
                    letterSpacing: "-2px",
                    margin: "12px 0 20px",
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
                    lineHeight: 1.75,
                  }}
                >
                  Before deployment, LaunchAlly analyzes your repository and
                  determines what it is, how it should be built, and whether
                  it can be deployed.
                </p>
              </div>

              <div
                style={{
                  background: "#070b16",
                  border: "1px solid rgba(255,255,255,.09)",
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: "0 25px 70px rgba(0,0,0,.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontWeight: 750 }}>
                    Repository analysis
                  </span>

                  <span
                    style={{
                      color: "#818cf8",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    V4
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
                    background: "rgba(34,197,94,.07)",
                    border: "1px solid rgba(34,197,94,.12)",
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

          {/* FEATURES */}
          <section
            style={{
              padding: "100px 20px",
              borderTop: "1px solid rgba(255,255,255,.05)",
              background: "rgba(15,23,42,.35)",
            }}
          >
            <div
              style={{
                maxWidth: 1050,
                margin: "0 auto",
              }}
            >
              <div style={{ marginBottom: 45 }}>
                <SectionLabel>ONE WORKSPACE</SectionLabel>

                <h2
                  style={{
                    fontSize: "clamp(32px,5vw,48px)",
                    letterSpacing: "-2px",
                    margin: "12px 0",
                  }}
                >
                  Everything after{" "}
                  <span style={{ color: "#818cf8" }}>
                    git push.
                  </span>
                </h2>
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
                  title="Environment variables"
                  text="Configure application secrets without scattering configuration across tools."
                />

                <Feature
                  number="03"
                  title="Teams"
                  text="Invite teammates and keep projects organized inside shared workspaces."
                />

                <Feature
                  number="04"
                  title="Deployment insights"
                  text="See deployment status, logs and live URLs from one dashboard."
                />
              </div>
            </div>
          </section>

          {/* VIDEO */}
          <section
            style={{
              maxWidth: 900,
              margin: "0 auto",
              padding: "110px 20px",
              textAlign: "center",
            }}
          >
            <SectionLabel>SEE IT IN ACTION</SectionLabel>

            <h2
              style={{
                fontSize: "clamp(32px,5vw,48px)",
                letterSpacing: "-2px",
                margin: "12px 0 18px",
              }}
            >
              Watch a repository go live.
            </h2>

            <p
              style={{
                color: "#94a3b8",
                maxWidth: 620,
                margin: "0 auto 30px",
                lineHeight: 1.7,
              }}
            >
              No slides. No marketing animation. See how LaunchAlly actually
              works.
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
          </section>

          {/* PRICING */}
          <section
            id="pricing"
            style={{
              padding: "100px 20px",
              borderTop: "1px solid rgba(255,255,255,.05)",
              background: "rgba(15,23,42,.35)",
            }}
          >
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <SectionLabel>PRICING</SectionLabel>

              <h2
                style={{
                  fontSize: "clamp(32px,5vw,48px)",
                  letterSpacing: "-2px",
                  margin: "12px 0",
                }}
              >
                Start free.
                <br />
                Upgrade when you need more.
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  marginBottom: 45,
                  lineHeight: 1.7,
                }}
              >
                No complicated infrastructure contracts. Build first, pay
                when LaunchAlly becomes part of your workflow.
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
                  text="For trying LaunchAlly and shipping your first projects."
                  items={[
                    "1 project",
                    "Up to 5 deployments",
                    "Team workspace",
                    "Deployment logs",
                  ]}
                />

                <PriceCard
                  title="Pro"
                  price="$5"
                  highlighted
                  text="For builders who are ready to ship without limits."
                  items={[
                    "Unlimited projects",
                    "Unlimited deployments",
                    "Team invites",
                    "AI-powered debugging",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section
            style={{
              maxWidth: 1050,
              margin: "0 auto",
              padding: "110px 20px 100px",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
                borderRadius: 24,
                padding: "75px 25px",
                border: "1px solid rgba(129,140,248,.2)",
                background:
                  "radial-gradient(circle at 50% 0%, rgba(99,102,241,.22), transparent 55%), #0c1222",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(36px,5vw,58px)",
                  lineHeight: 1.05,
                  letterSpacing: "-2.5px",
                  margin: "0 0 18px",
                }}
              >
                Stop preparing to deploy.
                <br />
                <span style={{ color: "#818cf8" }}>
                  Just deploy.
                </span>
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  maxWidth: 590,
                  margin: "0 auto 30px",
                  lineHeight: 1.7,
                }}
              >
                Your next production URL could be a few clicks away.
              </p>

              <Link
                to="/register"
                style={{
                  display: "inline-block",
                  background: "#6366f1",
                  color: "white",
                  textDecoration: "none",
                  padding: "15px 25px",
                  borderRadius: 10,
                  fontWeight: 800,
                  boxShadow: "0 12px 35px rgba(99,102,241,.3)",
                }}
              >
                Deploy my first project →
              </Link>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            borderTop: "1px solid rgba(255,255,255,.06)",
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
            <span>© {new Date().getFullYear()} LaunchAlly</span>

            <span>
              Ship software without becoming a DevOps engineer.
            </span>
          </div>
        </footer>
      </div>

      {/* VIDEO MODAL */}
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
                border: "1px solid rgba(255,255,255,.1)",
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

/* ---------- SMALL COMPONENTS ---------- */

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

function PreviewNav({ text, active }) {
  return (
    <div
      style={{
        padding: "10px 11px",
        marginBottom: 5,
        borderRadius: 7,
        background: active ? "rgba(99,102,241,.12)" : "transparent",
        color: active ? "#c7d2fe" : "#64748b",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
      }}
    >
      {text}
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
        borderBottom: "1px solid rgba(255,255,255,.05)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>

      <span
        style={{
          color: good ? "#a5b4fc" : "#e2e8f0",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function BigStep({ number, title, text }) {
  return (
    <div
      style={{
        padding: 25,
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,.07)",
        background: "rgba(7,11,22,.65)",
      }}
    >
      <div
        style={{
          color: "#6366f1",
          fontSize: 12,
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

function Feature({ number, title, text }) {
  return (
    <div
      style={{
        padding: 26,
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,.07)",
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
          color: highlighted ? "#a5b4fc" : "#cbd5e1",
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
          borderTop: "1px solid rgba(255,255,255,.06)",
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
            <span style={{ color: "#4ade80", marginRight: 8 }}>
              ✓
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
