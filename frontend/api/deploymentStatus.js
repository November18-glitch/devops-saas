import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normalizeStatus(state) {
  if (!state) return "BUILDING";

  const s = state.toUpperCase();

  if (
    s === "READY"
  ) {
    return "READY";
  }

  if (
    s === "ERROR" ||
    s === "FAILED" ||
    s === "CANCELED"
  ) {
    return "ERROR";
  }

  return "BUILDING";
}

function buildTroubleshooting(raw) {
  const text =
    String(raw || "")
      .toLowerCase();

  const fixes = [];

  if (
    text.includes(
      "package.json"
    )
  ) {
    fixes.push(
      "• package.json missing"
    );
  }

  if (
    text.includes(
      "module not found"
    )
  ) {
    fixes.push(
      "• install missing dependencies"
    );
  }

  if (
    text.includes(
      "command failed"
    )
  ) {
    fixes.push(
      "• verify build command"
    );
  }

  if (
    text.includes(
      "environment variable"
    )
  ) {
    fixes.push(
      "• add environment variables"
    );
  }

  if (
    text.includes(
      "npm"
    )
  ) {
    fixes.push(
      "• run npm install locally"
    );
  }

  if (
    text.includes(
      "next"
    )
  ) {
    fixes.push(
      "• verify next.config"
    );
  }

  if (
    fixes.length === 0
  ) {
    fixes.push(
      "• check repo structure"
    );

    fixes.push(
      "• run build locally"
    );

    fixes.push(
      "• verify framework"
    );
  }

  return fixes.join("\n");
}

async function fetchLogs(
  id,
  headers
) {
  try {
    const res =
      await fetch(
        `https://api.vercel.com/v6/deployments/${id}/events`,
        {
          headers,
        }
      );

    if (
      !res.ok
    ) {
      return "";
    }

    const data =
      await res.json();

    const events =
      data.events ||
      [];

    return events
      .map(
        (
          x
        ) =>
          x.payload
            ?.text ||
          ""
      )
      .filter(
        Boolean
      )
      .join(
        "\n"
      );

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

    if (
      !id
    ) {
      return res
        .status(
          400
        )
        .json({
          error:
            "missing id",
        });
    }

    const headers =
      {
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
        .status(
          500
        )
        .json({
          error:
            deployment
              ?.error
              ?.message ||
            "vercel failed",
        });
    }

    const status =
      normalizeStatus(
        deployment.readyState ||
          deployment.state
      );

    const url =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    const rawLogs =
      await fetchLogs(
        id,
        headers
      );

    let logs =
      rawLogs;

    if (
      status ===
      "READY"
    ) {
      logs = `
✅ Deployment successful

URL:
${url}

Finished in seconds.
`
        .trim();
    }

    if (
      status ===
      "ERROR"
    ) {
      logs = `
❌ Deployment failed

Reason:

${
  rawLogs ||
  deployment
    ?.error
    ?.message ||
  "Build failed"
}

Troubleshooting:

${buildTroubleshooting(
  rawLogs
)}
`
        .trim();
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
      .status(
        200
      )
      .json({
        status,
        logs,
        url,
      });

  } catch (
    err
  ) {
    return res
      .status(
        500
      )
      .json({
        error:
          err.message,
      });
  }
}