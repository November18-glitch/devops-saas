export default async function analyzeRepo(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      return {
        valid: false,
        reason: "Invalid GitHub repository URL",
      };
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");

    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!githubRes.ok) {
      return {
        valid: false,
        reason: "Repository not found or private",
      };
    }

    const repoData = await githubRes.json();

    const contentsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const contents = await contentsRes.json();

    const fileNames = Array.isArray(contents)
      ? contents.map((f) => f.name.toLowerCase())
      : [];

    const hasNext = fileNames.includes("next.config.js");
    const hasPackageJson = fileNames.includes("package.json");
    const hasVite = fileNames.includes("vite.config.js");
    const hasNx = fileNames.includes("nx.json");
    const hasTurbo = fileNames.includes("turbo.json");
    const hasDocker = fileNames.includes("dockerfile");

    // 🚫 unsupported repos
    if (hasNx || hasTurbo) {
      return {
        valid: false,
        reason:
          "Monorepo detected (Nx/Turbo). Advanced monorepos are not supported yet.",
      };
    }

    if (!hasPackageJson) {
      return {
        valid: false,
        reason:
          "No package.json found. This does not appear to be a deployable Node.js app.",
      };
    }

    let framework = "node";

    if (hasNext) framework = "nextjs";
    else if (hasVite) framework = "vite";

    return {
      valid: true,
      framework,
      defaultBranch: repoData.default_branch || "main",
      private: repoData.private,
      stars: repoData.stargazers_count,
      fullName: repoData.full_name,
    };

  } catch (err) {
    console.error("ANALYZE REPO ERROR:", err);

    return {
      valid: false,
      reason: "Failed to analyze repository",
    };
  }
}