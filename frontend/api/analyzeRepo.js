export default async function analyzeRepo(
  repoUrl
) {
  try {
    if (!repoUrl) {
      return {
        valid: false,
        reason: "Repository URL missing",
      };
    }

    const match =
      repoUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)/
      );

    if (!match) {
      return {
        valid: false,
        reason:
          "Invalid GitHub repository URL",
      };
    }

    const owner =
      match[1];

    const repo =
      match[2]
        .replace(
          ".git",
          ""
        );

    const response =
      await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        }
      );

    if (
      !response.ok
    ) {
      return {
        valid: false,
        reason:
          "Repository not found or inaccessible",
      };
    }

    const data =
      await response.json();

    return {
      valid: true,

      deployable:
        true,

      owner,

      repo,

      defaultBranch:
        data.default_branch ||
        "main",

      framework:
        "vite",

      buildCommand:
        "npm run build",

      installCommand:
        "npm install",

      outputDirectory:
        "dist",

      detected: [
        "package.json",
      ],
    };

  } catch (
    err
  ) {
    console.error(
      "ANALYZE REPO ERROR:",
      err
    );

    return {
      valid: false,
      reason:
        "Repository analysis failed",
    };
  }
}