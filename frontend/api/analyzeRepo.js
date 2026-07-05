const PACKAGE_LOCATIONS = [
  "package.json",
  "frontend/package.json",
  "client/package.json",
  "app/package.json",
  "web/package.json",
  "apps/web/package.json",
  "packages/web/package.json",
  "src/package.json"
];

const FRAMEWORKS = {
  next: {
    name: "nextjs",
    output: ".next"
  },

  vite: {
    name: "vite",
    output: "dist"
  },

  react: {
    name: "create-react-app",
    output: "build"
  },

  vue: {
    name: "vue",
    output: "dist"
  },

  nuxt: {
    name: "nuxt",
    output: ".output"
  },

  astro: {
    name: "astro",
    output: "dist"
  },

  angular: {
    name: "angular",
    output: "dist"
  },

  svelte: {
    name: "svelte",
    output: "build"
  },

  "@sveltejs/kit": {
    name: "sveltekit",
    output: "build"
  },

  remix: {
    name: "remix",
    output: "build"
  },

  express: {
    name: "express",
    output: null
  },

  "@nestjs/core": {
    name: "nestjs",
    output: "dist"
  },

  fastify: {
    name: "fastify",
    output: null
  }
};

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

function parseRepository(input) {
  if (!input) return null;

  input = input.trim();

  if (input.includes("github.com")) {
    const match = input.match(
      /github\.com\/([^\/]+)\/([^\/#?]+)/i
    );

    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2].replace(".git", "")
    };
  }

  if (input.includes("/")) {
    const parts = input.split("/");

    if (parts.length !== 2) return null;

    return {
      owner: parts[0],
      repo: parts[1]
    };
  }

  const parts = input.split(" ");

  if (parts.length !== 2) return null;

  return {
    owner: parts[0],
    repo: parts[1]
  };
}

async function fetchRepository(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: githubHeaders()
    }
  );

  if (res.status === 404) {
    return {
      ok: false,
      reason:
        "Repository not found. Check the owner and repository name."
    };
  }

  if (res.status === 403) {
    return {
      ok: false,
      reason:
        "GitHub rate limit reached or token invalid."
    };
  }

  if (res.status === 401) {
    return {
      ok: false,
      reason:
        "GitHub authentication failed."
    };
  }

  const repoData = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      reason:
        repoData.message || "Repository unavailable."
    };
  }

  if (repoData.private) {
    return {
      ok: false,
      private: true,
      reason:
        "This repository is private. LaunchAlly currently supports public repositories only."
    };
  }

  return {
    ok: true,
    data: repoData
  };
}

async function fetchPackageJson(owner, repo, branch) {
  for (const location of PACKAGE_LOCATIONS) {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${location}`
    );

    if (!res.ok) continue;

    try {
      const json = await res.json();

      return {
        found: true,
        path: location,
        json
      };
    } catch {}
  }

  return {
    found: false
  };
}

function calculateConfidence({
  framework,
  repositoryType,
  buildCommand,
  packageJson,
  warnings
}) {
  let score = 0;

  if (framework) score += 35;
  if (buildCommand) score += 25;
  if (packageJson.name) score += 10;
  if (packageJson.description) score += 5;
  if (packageJson.license) score += 5;

  if (repositoryType === "application") score += 20;

  if (repositoryType === "template") score += 15;

  if (repositoryType === "library") score -= 35;

  if (repositoryType === "plugin") score -= 40;

  if (repositoryType === "cli") score -= 50;

  score -= warnings.length * 2;

  score = Math.max(0, Math.min(score, 100));

  return score;
}

function chooseDeploymentStrategy({
  framework,
  repositoryType
}) {
  if (
    repositoryType !== "application" &&
    repositoryType !== "template"
  ) {
    return "unsupported";
  }

  switch (framework) {
    case "nextjs":
    case "vite":
    case "vue":
    case "astro":
    case "nuxt":
    case "react":
    case "create-react-app":
      return "vercel";

    case "express":
    case "fastify":
    case "nestjs":
      return "node";

    default:
      return "manual";
  }
}

export default async function analyzeRepo(repoInput) {
  try {

    const parsed = parseRepository(repoInput);

    if (!parsed) {
      return {
        valid: false,
        deployable: false,
        reason: "Invalid GitHub repository URL."
      };
    }

    const { owner, repo } = parsed;

    console.log(
      "[LaunchAlly Analyzer]",
      owner,
      repo
    );

    const repository = await fetchRepository(owner, repo);

    if (!repository.ok) {
      return {
        valid: false,
        deployable: false,
        private: repository.private || false,
        reason: repository.reason
      };
    }

    const repoData = repository.data;

    const packageResult =
      await fetchPackageJson(
        owner,
        repo,
        repoData.default_branch
      );
          if (!packageResult.found) {
      return {
        valid: true,
        deployable: false,
        owner,
        repo,
        defaultBranch: repoData.default_branch,
        reason:
          "No package.json found. LaunchAlly currently supports JavaScript/TypeScript projects.",
        detected: [],
        warnings: [
          "No Node.js project detected."
        ]
      };
    }

    const packageJson = packageResult.json;

    const detected = [
      packageResult.path
    ];

    const warnings = [];

    /*
    ==========================
    PACKAGE MANAGER
    ==========================
    */

    let packageManager = "npm";
    let installCommand = "npm install";

    if (
      packageJson.packageManager?.startsWith("pnpm")
    ) {
      packageManager = "pnpm";
      installCommand = "pnpm install";
    }

    else if (
      packageJson.packageManager?.startsWith("yarn")
    ) {
      packageManager = "yarn";
      installCommand = "yarn install";
    }

    else if (
      packageJson.packageManager?.startsWith("bun")
    ) {
      packageManager = "bun";
      installCommand = "bun install";
    }

    /*
    ==========================
    MONOREPO
    ==========================
    */

    if (packageJson.workspaces) {
      detected.push("workspaces");
      warnings.push(
        "Workspace detected."
      );

      if (packageManager === "npm") {
        packageManager = "pnpm";
        installCommand = "pnpm install";
      }
    }

    /*
    ==========================
    BUILD SCRIPT
    ==========================
    */

    const scripts =
      packageJson.scripts || {};

    let buildCommand = null;

    if (scripts.build) {
      buildCommand =
        `${packageManager} run build`;
    }

    else if (scripts["build:prod"]) {
      buildCommand =
        `${packageManager} run build:prod`;
    }

    else if (scripts.generate) {
      buildCommand =
        `${packageManager} run generate`;
    }

    else if (scripts.export) {
      buildCommand =
        `${packageManager} run export`;
    }

    else if (scripts["vercel-build"]) {
      buildCommand =
        `${packageManager} run vercel-build`;
    }

    if (!buildCommand) {
      return {
        valid: true,
        deployable: false,
        owner,
        repo,
        defaultBranch:
          repoData.default_branch,
        packageManager,
        installCommand,
        reason:
          "No build script found.",
        detected,
        warnings
      };
    }

    /*
    ==========================
    FRAMEWORK DETECTION
    ==========================
    */

    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };
    /*
====================================
DETECT MONOREPOS / LIBRARIES
====================================
*/

    let framework = null;
    let outputDirectory = "dist";

    for (const dependency of Object.keys(FRAMEWORKS)) {

      if (deps[dependency]) {

        framework =
          FRAMEWORKS[dependency].name;

        outputDirectory =
          FRAMEWORKS[dependency].output;

        detected.push(framework);

        break;
      }
    }
    /*
==========================
REPOSITORY TYPE
==========================
*/

let repositoryType = "application";

const lowerName =
  (packageJson.name || "").toLowerCase();

const lowerDescription =
  (packageJson.description || "").toLowerCase();

if (
  packageJson.bin
) {
  repositoryType = "cli";
}

else if (
  repo.toLowerCase().includes("plugin") ||
  lowerName.includes("plugin") ||
  packageJson.keywords?.includes("plugin")
) {
  repositoryType = "plugin";
}

else if (
  lowerDescription.includes("framework") ||
  packageJson.keywords?.includes("framework")
) {
  repositoryType = "library";
}

else if (
  packageJson.private === false &&
  (
    packageJson.main ||
    packageJson.module ||
    packageJson.exports
  )
) {
  repositoryType = "library";
}

else if (
  repoData.is_template ||
  repo.toLowerCase().includes("template") ||
  repo.toLowerCase().includes("starter") ||
  repo.toLowerCase().includes("boilerplate")
) {
  repositoryType = "template";
}
    /*
    ==========================
    FALLBACK DETECTION
    ==========================
    */

    if (!framework) {

      if (scripts.dev?.includes("vite")) {

        framework = "vite";
        outputDirectory = "dist";

      }

      else if (
        scripts.dev?.includes("next")
      ) {

        framework = "nextjs";
        outputDirectory = ".next";

      }

      else if (
        scripts.dev?.includes("astro")
      ) {

        framework = "astro";
        outputDirectory = "dist";

      }

      else if (
        scripts.dev?.includes("ng")
      ) {

        framework = "angular";
        outputDirectory = "dist";

      }

      else if (
        scripts.dev?.includes("svelte")
      ) {

        framework = "svelte";

        outputDirectory = "build";

      }

      if (framework) {
        detected.push(framework);
      }
    }

    if (!framework) {
      warnings.push(
        "Unknown framework."
      );
    }

    /*
    ==========================
    NODE VERSION
    ==========================
    */

    let nodeVersion = null;

    

    if (packageJson.engines?.node) {

      nodeVersion =
        packageJson.engines.node;

      detected.push(
        `node ${nodeVersion}`
      );
    }
        /*
    ==========================
    DEPLOYMENT VALIDATION
    ==========================
    */

    if (!framework) {
      return {
        valid: true,

        deployable: false,

        owner,

        repo,

        defaultBranch: repoData.default_branch,

        packageManager,

        installCommand,

        buildCommand,

        framework: null,

        outputDirectory: null,

        nodeVersion,

        detected,

        warnings,

        reason:
         "This repository doesn't appear to be a deployable web application. LaunchAlly currently supports Next.js, React, Vite, Vue, Nuxt, Astro, Angular, Svelte, Express, NestJS and Fastify projects.",
      };
    }

    /*
    ==========================
    EXTRA WARNINGS
    ==========================
    */

    if (!packageJson.license) {
      warnings.push(
        "Repository has no license."
      );
    }

    if (!packageJson.description) {
      warnings.push(
        "Repository has no description."
      );
    }

    if (
      framework === "nextjs" &&
      !deps.typescript &&
      !deps["@types/react"]
    ) {
      warnings.push(
        "Looks like a JavaScript Next.js project."
      );
    }
    const confidence = calculateConfidence({
     framework,
     repositoryType,
     buildCommand,
     packageJson,
     warnings
    });

     let confidenceLabel;

     if (confidence >= 90) {
      confidenceLabel = "Excellent";
    }
     else if (confidence >= 75) {
      confidenceLabel = "High";
    }
     else if (confidence >= 60) {
      confidenceLabel = "Medium";
    }
     else {
      confidenceLabel = "Low";
    }

    const deploymentStrategy = chooseDeploymentStrategy({
     framework,
     repositoryType
    });

    detected.push(`${confidenceLabel} (${confidence}%)`);
    detected.push(deploymentStrategy);

    /*
    ==========================
    SUCCESS
    ==========================
    */
console.log("========== LaunchAlly ==========");
console.log("Framework:", framework);
console.log("Detected:", detected);
console.log("Package:", packageJson.name);
console.log("Build:", buildCommand);
console.log("Output:", outputDirectory);
console.log("===============================");
    return {
      valid: true,

      deployable: true,

      owner,

      repo,

      repositoryType,

      confidence,

      deploymentStrategy,

      confidenceLabel,

      defaultBranch:
        repoData.default_branch,

      framework,

      packageManager,

      installCommand,

      buildCommand,

      outputDirectory,

      nodeVersion,

      detected,

      warnings,

      reason: null
    };

  }

  catch (err) {

    console.error(
      "[LaunchAlly Analyzer]",
      err
    );

    return {

      valid: false,

      deployable: false,

      reason:
        err.message ||
        "Repository analysis failed."
    };

  }

}