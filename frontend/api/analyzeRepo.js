export default async function analyzeRepo(
  repoInput
) {
  try {
    if (!repoInput) {
      return {
        valid: false,
        deployable: false,
        reason:
          "Repository URL missing",
      };
    }

    let owner;
    let repo;

    /*
    ==========================
    PARSE INPUT
    ==========================
    */

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
          deployable: false,
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
    } else {
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
          deployable: false,
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

    /*
    ==========================
    LOAD REPO
    ==========================
    */

    const repoRes =
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
      !repoRes.ok
    ) {
      return {
        valid: false,
        deployable: false,
        reason:
          "Repository not found",
      };
    }

    const repoData =
      await repoRes.json();

    /*
    ==========================
    FIND PACKAGE.JSON
    ==========================
    */

    let packagePath =
      "package.json";

    let packageRes =
      await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/package.json`
      );

    if (
      !packageRes.ok
    ) {
      packagePath =
        "frontend/package.json";

      packageRes =
        await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/frontend/package.json`
        );
    }

    if (
      !packageRes.ok
    ) {
      return {
        valid: true,
        deployable: false,

        owner,
        repo,

        reason:
          "package.json not found",

        detected: [],
      };
    }

    let packageJson;

    try {
      packageJson =
        await packageRes.json();
    } catch {
      return {
        valid: true,
        deployable: false,

        owner,
        repo,

        reason:
          "Invalid package.json",
      };
    }

    /*
    ==========================
    DETECT PACKAGE MANAGER
    ==========================
    */

    let installCommand =
      "npm install";

    let buildCommand =
      packageJson
        .scripts?.build
        ? "npm run build"
        : null;

    if (
      packageJson.workspaces ||
      packageJson.packageManager
        ?.includes(
          "pnpm"
        )
    ) {
      installCommand =
        "pnpm install";

      buildCommand =
        packageJson
          .scripts?.build
          ? "pnpm run build"
          : null;
    }

    /*
    ==========================
    FRAMEWORK DETECTION
    ==========================
    */

    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    let framework =
      null;

    let outputDirectory =
      null;

    if (
      deps.vite
    ) {
      framework =
        "vite";

      outputDirectory =
        "dist";
    }

    else if (
      deps.next
    ) {
      framework =
        "nextjs";

      outputDirectory =
        ".next";
    }

    else if (
      deps.react
    ) {
      framework =
        "vite";

      outputDirectory =
        "dist";
    }

    else if (
      deps.nuxt
    ) {
      framework =
        "nuxtjs";

      outputDirectory =
        ".output";
    }

    /*
    ==========================
    FRONTEND DIRECTORY
    ==========================
    */

    if (
      packagePath ===
      "frontend/package.json"
    ) {
      outputDirectory =
        outputDirectory
          ? `frontend/${outputDirectory}`
          : null;
    }

    /*
    ==========================
    BUILD CHECK
    ==========================
    */

    if (
      !buildCommand
    ) {
      return {
        valid: true,
        deployable: false,

        owner,
        repo,

        framework,

        installCommand,

        outputDirectory,

        reason:
          "Missing build script",

        detected: [
          packagePath,
        ],
      };
    }

    /*
    ==========================
    SUCCESS
    ==========================
    */

    return {
      valid: true,

      deployable: true,

      owner,

      repo,

      defaultBranch:
        repoData.default_branch,

      framework,

      installCommand,

      buildCommand,

      outputDirectory,

      detected: [
        packagePath,
        framework ||
          "unknown",
      ],
    };
  }

  catch (
    err
  ) {
    console.error(
      "[ANALYZE]",
      err
    );

    return {
      valid: false,

      deployable: false,

      reason:
        err.message ||
        "Analysis failed",
    };
  }
}