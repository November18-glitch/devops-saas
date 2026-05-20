import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getDeploymentLogs(id) {
  try {
    const logsRes = await fetch(
      `https://api.vercel.com/v2/deployments/${id}/events`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    if (!logsRes.ok) {
      return [];
    }

    const logs = await logsRes.json();

    return logs || [];

  } catch {
    return [];
  }
}

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

    const events = await getDeploymentLogs(id);

    const buildLogs =
      events
        ?.slice(-20)
        ?.map(
          (e) =>
            `${e.created ? new Date(e.created).toLocaleTimeString() : ""}
${e.text || e.payload?.text || e.name || ""}`
        )
        .join("\n\n") || "";

    let status = deployment.readyState || "BUILDING";

    let logMessage = "";

    if (status === "READY") {
      logMessage = `
✅ Deployment successful

URL:
https://${deployment.url}

Framework:
${deployment.framework || "auto"}

Recent build logs:

${buildLogs || "Build completed successfully"}
      `.trim();
    }

    else if (
      status === "ERROR" ||
      status === "CANCELED"
    ) {

      const reason =
        deployment.errorMessage ||
        deployment.error?.message ||
        deployment.readyStateReason ||
        deployment.aliasError ||
        "Unknown build failure";

      logMessage = `
❌ Deployment failed

Reason:
${reason}

Recent build logs:

${buildLogs || "No build logs returned"}

Possible fixes:

• Check package.json
• Verify environment variables
• Check build command
• Verify framework detection
• Check GitHub access
• Open deployment in Vercel
      `.trim();
    }

    else {

      logMessage = `
⚙️ Building...

Status:
${status}

Framework:
${deployment.framework || "Detecting..."}

Recent activity:

${buildLogs || "Waiting for build logs..."}
      `.trim();
    }

    const deploymentUrl =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    await supabase
      .from("deployments")
      .update({
        status,
        logs: logMessage,
        url: deploymentUrl,
      })
      .eq("deployment_id", id);

    return res.status(200).json({
      status,
      url: deploymentUrl,
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