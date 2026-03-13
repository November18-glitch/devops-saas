export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" })
    }

    const { repoUrl, projectName } = req.body

    if (!repoUrl) {
      return res.status(400).json({ error: "Missing repoUrl" })
    }

    const vercelResponse = await fetch(
      "https://api.vercel.com/v13/deployments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: projectName || "deployally-project",
          gitSource: {
            type: "github",
            repo: repoUrl
          }
        })
      }
    )

    const text = await vercelResponse.text()

    return res.status(200).json({
      success: true,
      vercelStatus: vercelResponse.status,
      response: text
    })

  } catch (error) {

    console.error("DEPLOY ERROR:", error)

    return res.status(500).json({
      error: error.message
    })

  }

}