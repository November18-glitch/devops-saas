import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchBuildLogs(id, headers) {
  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments/${id}/events`,
      { headers }
    );

    if (!res.ok) return "";

    const data = await res.json();

    if (!Array.isArray(data)) {
      return "";
    }

    return data
      .map((x) => {
        return (
          x.payload?.text ||
          x.text ||
          x.payload?.name ||
          x.name ||
          ""
        );
      })
      .filter(Boolean)
      .join("\n");

  } catch {
    return "";
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

    const headers = {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    };

    const deploymentRes = await fetch(
      `https://api.vercel.com/v13/deployments/${id}`,
      { headers }
    );

    const deployment =
      await deploymentRes.json();

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

    const finalUrl =
      deployment.url
        ? `https://${deployment.url}`
        : null;

    const inspectorUrl =
      deployment.inspectorUrl
        ? `https://${deployment.inspectorUrl}`
        : null;

    let logs =
      await fetchBuildLogs(
        id,
        headers
      );

    if (
      status === "READY"
    ) {
      logs =
        logs ||
        `
✅ Deployment successful

URL:
${finalUrl}
`.trim();
    }

    if (
      status === "ERROR"
    ) {
      logs = `
❌ Deployment failed

${
  logs ||
  deployment.error?.message ||
  deployment.error?.code ||
  "No build logs returned"
}

────────────────

Open Vercel Build Logs:
${inspectorUrl || "Unavailable"}

Common fixes:
• Missing environment variables
• next.config issue
• package.json scripts
• install/build command
• GitHub access
`.trim();
    }

    if (
      status !== "READY" &&
      status !== "ERROR"
    ) {
      logs = `
⚙️ Building...

Current state:
${status}
`.trim();
    }

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