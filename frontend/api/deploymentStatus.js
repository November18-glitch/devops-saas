import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchBuildLogs(id, headers) {
  try {
    console.log("[LOGS] fetching events", id);

    const res = await fetch(
      `https://api.vercel.com/v6/deployments/${id}/events`,
      { headers }
    );

    console.log(
      "[LOGS] events status:",
      res.status
    );

    const raw = await res.text();

    console.log(
      "[LOGS] events raw:",
      raw.slice(0, 3000)
    );

    let data = [];

    try {
      data = JSON.parse(raw);
    } catch {
      return raw;
    }

    const events =
      data.events ||
      data ||
      [];

    if (!Array.isArray(events)) {
      return JSON.stringify(events);
    }

    return events
      .map(
        (e) =>
          e.payload?.text ||
          e.payload?.name ||
          e.text ||
          e.name ||
          JSON.stringify(e)
      )
      .join("\n");

  } catch (e) {
    console.error(
      "[LOGS ERROR]",
      e
    );

    return "";
  }
}

export default async function handler(
  req,
  res
) {
  try {
    const { id } = req.query;

    console.log(
      "[START]",
      id
    );

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

    console.log(
      "[DEPLOY STATUS]",
      depRes.status
    );

    const raw =
      await depRes.text();

    console.log(
      "[DEPLOY RAW]",
      raw.slice(0, 3000)
    );

    let deployment;

    try {
      deployment =
        JSON.parse(raw);
    } catch {
      return res
        .status(500)
        .json({
          error:
            "Bad deployment JSON",
        });
    }

    const status =
      deployment.readyState ||
      deployment.state ||
      "UNKNOWN";

    const url =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    const inspector =
      deployment.inspectorUrl
        ? `https://${deployment.inspectorUrl}`
        : null;

    console.log(
      "[READY STATE]",
      status
    );

    let logs =
      await fetchBuildLogs(
        id,
        headers
      );

    if (!logs) {
      logs =
JSON.stringify(
deployment,
null,
2
).slice(
0,
6000
);
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

    console.log(
      "[UPDATED]"
    );

    return res
      .status(200)
      .json({
        status,
        logs,
        url,
        inspector,
      });

  } catch (err) {
    console.error(
      "[FATAL]",
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