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

    const vercelRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    const deployment = await vercelRes.json();

    if (!vercelRes.ok) {
      return res.status(500).json({
        error:
          deployment.error?.message ||
          "Failed to fetch deployment",
      });
    }

    let status = deployment.readyState || "BUILDING";

    let logMessage = "";

    if (status === "READY") {
      logMessage = `
✅ Deployment successful

URL:
https://${deployment.url}

Framework:
${deployment.framework || "auto"}

Build completed successfully.
      `.trim();
    }

    else if (status === "ERROR") {

      const reason =
        deployment.errorMessage ||
        deployment.error?.message ||
        deployment.aliasError ||
        deployment.inspectorUrl ||
        deployment.readyStateReason ||
        "Unknown build failure";

      logMessage = `
❌ Deployment failed

Reason:
${reason}

Possible causes:
• Missing environment variables
• Build command failed
• Unsupported framework
• Missing package.json
• GitHub permissions issue
• Vercel configuration issue

Deployment URL:
https://${deployment.url}
      `.trim();
    }

    else {

      logMessage = `
⚙️ Building...

Current state:
${status}

Framework:
${deployment.framework || "Detecting..."}

Waiting for Vercel...
      `.trim();
    }

    await supabase
      .from("deployments")
      .update({
        status,
        logs: logMessage,
        url: deployment.url
          ? `https://${deployment.url}`
          : null,
      })
      .eq("deployment_id", id);

    return res.status(200).json({
      status,
      url: deployment.url
        ? `https://${deployment.url}`
        : null,
      logs: logMessage,
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}