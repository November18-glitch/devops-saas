import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    const { email, token } = req.body

    const joinUrl = `https://deployally.vercel.app/join?token=${token}`

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "You're invited to DeployAlly",
      html: `
        <h2>You were invited to DeployAlly</h2>
        <p>Click below to join the team:</p>
        <a href="${joinUrl}">${joinUrl}</a>
      `
    })

    return res.status(200).json(data)

  } catch (error) {
    console.error("EMAIL ERROR:", error)
    return res.status(500).json({ error: error.message })
  }

}