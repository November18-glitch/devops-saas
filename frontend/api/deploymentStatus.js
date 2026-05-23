import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchBuildLogs(id, headers) {
  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments/${id}/events`,
      {
        headers,
      }
    );

    if (!res.ok) {
      return "";
    }

    const data = await res.json();

    const events =
      data.events ||
      data ||
      [];

    if (!Array.isArray(events)) {
      return "";
    }

    const logs =
      events
        .map((e) => {
          return (
            e.payload?.text ||
            e.payload?.name ||
            e.text ||
            e.name ||
            e.created ||
            ""
          );
        })
        .filter(Boolean)
        .join("\n");

    return logs;

  } catch {
    return "";
  }
}

export default async function handler(
  req,
  res
) {
  try {
    const { id } =
      req.query;

    if (!id) {
      return res
        .status(400)
        .json({
          error:
            "Missing deployment id",
        });
    }

    const headers = {
      Authorization:
        `Bearer ${process.env.VERCEL_TOKEN}`,
    };

    const depRes =
      await fetch(
        `https://api.vercel.com/v13/deployments/${id}`,
        {
          headers,
        }
      );

    const deployment =
      await depRes.json();

    if (!depRes.ok) {
      return res
        .status(500)
        .json({
          error:
            deployment?.error
              ?.message ||
            "Failed to fetch deployment",
        });
    }

    const status =
      deployment.readyState ||
      "BUILDING";

    const url =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    const inspector =
      deployment.inspectorUrl
        ? `https://${deployment.inspectorUrl}`
        : null;

    let logs =
      await fetchBuildLogs(
        id,
        headers
      );

    /*
      IMPORTANT:
      if failed and Vercel logs empty,
      pull real error immediately
    */

    if (
      status ===
      "ERROR"
    ) {
      logs =
        logs ||
        deployment.error?.message ||
        deployment.error?.code ||
        deployment.error?.stack ||
        deployment.aliasError ||
        deployment.meta?.githubCommitMessage ||
        "Build failed but Vercel returned no logs";

      logs = `
❌ Deployment failed

${logs}

────────────────

Build Inspector:
${inspector || "Unavailable"}

Deployment:
${url || "Unavailable"}

Status:
${status}
`.trim();
    }

    if (
      status ===
      "READY"
    ) {
      logs =
        logs ||
        `
✅ Deployment successful

URL:
${url}
`.trim();
    }

    if (
      status ===
      "BUILDING"
    ) {
      logs =
        logs ||
        `
⚙️ Building...

Status:
${status}

Fetching live logs...
`.trim();
    }

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
    console.error(
      err
    );

    return res
      .status(500)
      .json({
        error:
          err.message,
      });
  }
}