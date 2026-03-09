import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, token } = req.body;

  const inviteLink =
    `https://devops-saas.vercel.app/auth/callback?invite=${token}`;

  try {

    await resend.emails.send({
      from: "DeployAlly <onboarding@resend.dev>",
      to: email,
      subject: "You're invited to join DeployAlly",
      html: `
        <h2>DeployAlly Team Invite</h2>

        <p>You were invited to join a team.</p>

        <a href="${inviteLink}"
        style="
        background:#6366f1;
        color:white;
        padding:12px 20px;
        border-radius:6px;
        text-decoration:none;
        display:inline-block;
        ">
        Join Team
        </a>

        <p>If the button does not work:</p>
        <p>${inviteLink}</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error(error);

    return res.status(500).json({ error: "Email failed" });

  }

}