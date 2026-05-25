export default async function analyzeRepo(
  repoInput
) {
  try {

    if (!repoInput) {
      return {
        valid: false,
        reason: "Repository URL missing",
      };
    }

    let owner;
    let repo;

    // FULL URL
    if (
      repoInput.includes(
        "github.com"
      )
    ) {
      const match =
        repoInput.match(
          /github\.com\/([^\/]+)\/([^\/]+)/i
        );

      if (!match) {
        return {
          valid: false,
          reason:
            "Invalid GitHub repository URL",
        };
      }

      owner =
        match[1];

      repo =
        match[2]
          .replace(
            ".git",
            ""
          );

    }

    // OWNER + REPO
    else {

      const parts =
        repoInput
          .trim()
          .split(" ");

      if (
        parts.length !==
        2
      ) {
        return {
          valid: false,
          reason:
            "Invalid GitHub repository",
        };
      }

      owner =
        parts[0];

      repo =
        parts[1];
    }

    console.log(
      "[CHECKING REPO]",
      owner,
      repo
    );

    const res =
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
      !res.ok
    ) {
      return {
        valid: false,
        reason:
          "Repository not found",
      };
    }

    const data =
      await res.json();

    return {
      valid: true,
      deployable: true,

      owner,
      repo,

      defaultBranch:
        data.default_branch,

      framework:
        "vite",

      installCommand:
        "npm install",

      buildCommand:
        "npm run build",

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
      "[ANALYZE]",
      err
    );

    return {
      valid: false,
      reason:
        "Analysis failed",
    };
  }
}