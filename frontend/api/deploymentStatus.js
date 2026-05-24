import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildHelpfulMessage(status, deployment, logs) {
  const url =
    deployment.url
      ? `https://${deployment.url}`
      : null;

  if (status === "READY") {
    return `
✅ Deployment successful

Your project is live.

URL:
${url}

Everything completed correctly.
`.trim();
  }

  if (
    status === "ERROR" ||
    status === "CANCELED"
  ) {
    const reason =
      deployment.error?.message ||
      deployment.error?.code ||
      logs ||
      "Build failed";

    let fix = [];

    const lower =
      reason.toLowerCase();

    if (
      lower.includes("package")
    ) {
      fix.push(
        "• Check package.json exists"
      );
    }

    if (
      lower.includes("module")
    ) {
      fix.push(
        "• Install missing dependencies"
      );
    }

    if (
      lower.includes("env")
    ) {
      fix.push(
        "• Add environment variables"
      );
    }

    if (
      lower.includes("build")
    ) {
      fix.push(
        "• Verify build command"
      );
    }

    if (
      lower.includes("github")
    ) {
      fix.push(
        "• Verify GitHub permissions"
      );
    }

    if (
      fix.length === 0
    ) {
      fix = [
        "• Check repo structure",
        "• Verify framework",
        "• Verify install/build commands",
      ];
    }

    return `
❌ Deployment failed

Reason:
${reason}

How to fix:

${fix.join("\n")}
`.trim();
  }

  return `
⚙️ Deploying...

Current State:
${status}

Waiting for build result...
`.trim();
}

async function fetchEvents(
  id,
  headers
) {
  try {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        2500
      );

    const res =
      await fetch(
        `https://api.vercel.com/v6/deployments/${id}/events`,
        {
          headers,
          signal:
            controller.signal,
        }
      );

    clearTimeout(
      timeout
    );

    if (
      !res.ok
    ) {
      return "";
    }

    const json =
      await res.json();

    const events =
      json.events ||
      json ||
      [];

    if (
      !Array.isArray(
        events
      )
    ) {
      return "";
    }

    return events
      .slice(-15)
      .map(
        (x) =>
          x.payload
            ?.text ||
          x.text ||
          ""
      )
      .filter(Boolean)
      .join("\n");

  } catch {
    return "";
  }
}

export default async function handler(
  req,
  res
) {
  try {
    const id =
      req.query.id;

    if (!id) {
      return res
        .status(400)
        .json({
          error:
            "Missing deployment id",
        });
    }

    const existing =
      await supabase
        .from(
          "deployments"
        )
        .select(
          "status,logs,url"
        )
        .eq(
          "deployment_id",
          id
        )
        .single();

    if (
      existing.data &&
      (
        existing.data
          .status ===
          "READY" ||
        existing.data
          .status ===
          "ERROR"
      )
    ) {
      return res
        .status(200)
        .json(
          existing.data
        );
    }

    const headers = {
      Authorization:
        `Bearer ${process.env.VERCEL_TOKEN}`,
    };

    const dep =
      await fetch(
        `https://api.vercel.com/v13/deployments/${id}`,
        {
          headers,
        }
      );

    const deployment =
      await dep.json();

    if (
      !dep.ok
    ) {
      return res
        .status(500)
        .json({
          error:
            deployment
              ?.error
              ?.message ||
            "Vercel error",
        });
    }

    const status =
      deployment.readyState ||
      "BUILDING";

    const url =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    const rawLogs =
      await fetchEvents(
        id,
        headers
      );

    const logs =
      buildHelpfulMessage(
        status,
        deployment,
        rawLogs
      );

    await supabase
      .from(
        "deployments"
      )
      .update({
        status,
        logs,
        url,
      })
      .eq(
        "deployment_id",
        id
      );

    return res
      .status(200)
      .json({
        status,
        logs,
        url,
      });

  } catch (
    err
  ) {
    return res
      .status(500)
      .json({
        error:
          err.message,
      });
  }
}