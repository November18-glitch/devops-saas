export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { repoUrl } = req.body

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "deployally-project",
        gitSource: {
          type: "github",
          repo: repoUrl
        }
      })
    })

    const data = await response.json()

    res.status(200).json(data)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Deployment failed"
    })

  }

}