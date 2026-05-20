import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: "Missing repoUrl",
      });
    }

    const match = repoUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+)/
    );

    if (!match) {
      return res.status(400).json({
        error: "Invalid GitHub URL",
      });
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");

    // CHECK REPO EXISTS
    const repoRes = await octokit.repos.get({
      owner,
      repo,
    });

    const repoData = repoRes.data;

    const result = {
      framework: "Unknown",
      packageJson: false,
      buildScript: false,
      vercelConfig: false,
      dockerfile: false,
      privateRepo: repoData.private,
      defaultBranch: repoData.default_branch,
      warnings: [],
      errors: [],
      success: true,
    };

    // ROOT FILES
    const contents = await octokit.repos.getContent({
      owner,
      repo,
      path: "",
    });

    const files = contents.data.map((f) => f.name);

    // package.json
    if (files.includes("package.json")) {
      result.packageJson = true;

      const pkgFile = await octokit.repos.getContent({
        owner,
        repo,
        path: "package.json",
      });

      const pkg = JSON.parse(
        Buffer.from(pkgFile.data.content, "base64").toString()
      );

      if (pkg.scripts?.build) {
        result.buildScript = true;
      } else {
        result.errors.push(
          "No build script found in package.json"
        );
      }

      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (deps.next) {
        result.framework = "Next.js";
      } else if (deps.react) {
        result.framework = "React";
      } else if (deps.vue) {
        result.framework = "Vue";
      } else if (deps.svelte) {
        result.framework = "Svelte";
      }

    } else {
      result.errors.push("Missing package.json");
    }

    // vercel.json
    if (files.includes("vercel.json")) {
      result.vercelConfig = true;
    }

    // Dockerfile
    if (files.includes("Dockerfile")) {
      result.dockerfile = true;
      result.warnings.push(
        "Docker deployment detected"
      );
    }

    // WARNINGS
    if (repoData.private) {
      result.warnings.push(
        "Private repository detected"
      );
    }

    if (!result.buildScript) {
      result.errors.push(
        "Project has no build script"
      );
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error("ANALYZE REPO ERROR:", err);

    return res.status(500).json({
      error: "Failed to analyze repository",
      details: err.message,
    });
  }
}