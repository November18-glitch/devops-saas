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

    // deployment state
    const deploymentRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
      { headers }
    );

    const deployment = await deploymentRes.json();

    if (!deploymentRes.ok) {
      return res.status(500).json({
        error:
          deployment.error?.message ||
          "Failed to fetch deployment",
      });
    }

    let status =
      deployment.readyState ||
      "BUILDING";

    let logs = "";

    // fetch deployment events/logs
    try {
      const eventsRes = await fetch(
        `https://api.vercel.com/v2/deployments/${id}/events`,
        { headers }
      );

      if (eventsRes.ok) {
        const events = await eventsRes.json();

        logs =
          events
            ?.map((e) => {
              const text =
                e.text ||
                e.payload?.text ||
                e.payload?.name ||
                "";

              return text;
            })
            .filter(Boolean)
            .join("\n") || "";
      }
    } catch {}

    if (status === "READY") {
      logs =
        logs ||
        `
✅ Deployment successful

URL:
https://${deployment.url}

Build finished successfully.
`.trim();
    }

    if (status === "ERROR") {
      logs = `
❌ Deployment failed

${logs || "No Vercel logs available"}

Troubleshooting:

• Check build command
• Check install command
• Check environment variables
• Check package.json
• Check framework detection
• Check GitHub permissions

Inspect:
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