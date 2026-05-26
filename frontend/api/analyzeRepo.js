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
    GET REPO
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
      "npm run build";

    if (
      packageJson.workspaces
    ) {

      installCommand =
        "pnpm install";

      buildCommand =
        "pnpm run build";
    }

    if (
      packageJson.packageManager
        ?.includes(
          "pnpm"
        )
    ) {

      installCommand =
        "pnpm install";

      buildCommand =
        "pnpm run build";
    }

    /*
    ==========================
    DETECT BUILD SCRIPT
    ==========================
    */

    if (
      !packageJson.scripts
        ?.build
    ) {
      return {
        valid: true,
        deployable: false,

        owner,
        repo,

        reason:
          "Missing build script",

        detected: [
          packagePath,
        ],
      };
    }

    /*
    ==========================
    DETECT FRAMEWORK
    ==========================
    */

    let framework =
      "other";

    let outputDirectory =
      "dist";

    const deps = {

      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

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
        "create-react-app";

      outputDirectory =
        "build";
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
    FRONTEND FOLDER
    ==========================
    */

    if (
      packagePath.startsWith(
        "frontend/"
      )
    ) {

      installCommand =
        `cd frontend && ${installCommand}`;

      buildCommand =
        `cd frontend && ${buildCommand}`;

      outputDirectory =
        `frontend/${outputDirectory}`;
    }

    /*
    ==========================
    DONE
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
        framework,
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