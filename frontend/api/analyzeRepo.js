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
    }

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
    CHECK PACKAGE
    ==========================
    */

    const packageCandidates = [
      "frontend/package.json",
      "package.json",
    ];

    let packageJson =
      null;

    let packagePath =
      null;

    for (
      const candidate
      of packageCandidates
    ) {
      const response =
        await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/${candidate}`
        );

      if (
        response.ok
      ) {
        try {
          packageJson =
            await response.json();

          packagePath =
            candidate;

          break;

        } catch {}
      }
    }

    if (
      !packageJson
    ) {
      return {
        valid: true,

        deployable:
          false,

        owner,

        repo,

        reason:
          "package.json not found",

        detected: [],
      };
    }

    /*
    ==========================
    COMMANDS
    ==========================
    */

    let installCommand =
      "npm install";

    let buildCommand =
      "npm run build";

    if (
      packageJson
        .packageManager
        ?.includes(
          "pnpm"
        )
    ) {
      installCommand =
        "pnpm install";

      buildCommand =
        "pnpm run build";
    }

    if (
      packageJson
        .workspaces
    ) {
      installCommand =
        "pnpm install";

      buildCommand =
        "pnpm build";
    }

    /*
    ==========================
    BUILD CHECK
    ==========================
    */

    if (
      !packageJson
        .scripts
        ?.build
    ) {
      return {
        valid: true,

        deployable:
          false,

        owner,

        repo,

        framework:
          null,

        installCommand,

        buildCommand,

        outputDirectory:
          null,

        reason:
          "Missing build script",

        detected: [
          packagePath,
        ],
      };
    }

    /*
    ==========================
    FRAMEWORK
    ==========================
    */

    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    let framework =
      null;

    let outputDirectory =
      "dist";

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

    /*
    IMPORTANT:
    DO NOT prepend
    frontend/
    DO NOT use
    cd frontend &&
    deployProject handles rootDirectory
    */

    return {
      valid: true,

      deployable:
        framework !==
        null,

      owner,

      repo,

      defaultBranch:
        repoData.default_branch,

      framework,

      installCommand,

      buildCommand,

      outputDirectory,

      reason:
        framework
          ? null
          : "Unsupported framework",

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

      deployable:
        false,

      reason:
        err.message ||
        "Analysis failed",
    };
  }
}