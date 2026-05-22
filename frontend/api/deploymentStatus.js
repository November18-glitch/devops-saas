import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Missing deployment id",
      });
    }

    const headers = {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    };

    // Get deployment
    const deploymentRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
      {
        headers,
      }
    );

    const deployment = await deploymentRes.json();

    if (!deploymentRes.ok) {
      return res.status(500).json({
        error:
          deployment.error?.message ||
          "Failed to fetch deployment",
      });
    }

    const status =
      deployment.readyState ||
      "BUILDING";

    let logs = "";

    // FETCH BUILD LOGS (THIS WAS THE BROKEN PART)
    try {
      const logsRes = await fetch(
        `https://api.vercel.com/v2/deployments/${id}/events?limit=500`,
        {
          headers,
        }
      );

      if (logsRes.ok) {
        const raw = await logsRes.json();

        const entries =
          raw.events ||
          raw ||
          [];

        logs = entries
          .map((e) => {
            return (
              e.text ||
              e.payload?.text ||
              e.payload?.message ||
              e.payload?.name ||
              ""
            );
          })
          .filter(Boolean)
          .join("\n");
      }
    } catch (e) {
      console.log("logs fetch failed");
    }

    // ERROR DETAILS
    if (status === "ERROR") {
      logs = `
❌ Deployment failed

${
  logs ||
  deployment.errorMessage ||
  deployment.error?.message ||
  "Vercel returned no build logs."
}

━━━━━━━━━━━━━━

Possible causes:

• Build command failed
• package.json scripts missing
• Environment variables missing
• Wrong output directory
• GitHub repo inaccessible
• Install failed
• Framework detection failed

Deployment:
https://${deployment.url}
`.trim();
    }

    if (status === "READY") {
      logs =
        logs ||
        `
✅ Deployment successful

URL:
https://${deployment.url}
`.trim();
    }

    if (
      status !== "READY" &&
      status !== "ERROR"
    ) {
      logs =
        logs ||
        `
⚙️ Building...

Current state:
${status}

Waiting for Vercel...
`.trim();
    }

    const finalUrl =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    await supabase
      .from("deployments")
      .update({
        status,
        logs,
        url: finalUrl,
      })
      .eq(
        "deployment_id",
        id
      );

    return res.status(200).json({
      status,
      logs,
      url: finalUrl,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
}