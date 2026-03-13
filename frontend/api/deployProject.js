export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body || {}

    const repoUrl = body.repoUrl
    const projectName = body.projectName || "deployally"

    if (!repoUrl) {
      return res.status(400).json({
        error: "repoUrl missing"
      })
    }

    const response = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: projectName,
          gitSource: {
            type: "github",
            repo: repoUrl
          }
        })
      }
    )

    const text = await response.text()

    return res.status(200).json({
      success: true,
      vercelStatus: response.status,
      response: text
    })

  } catch (err) {

    console.error("DEPLOY ERROR:", err)

    return res.status(500).json({
      error: err.message
    })

  }

}