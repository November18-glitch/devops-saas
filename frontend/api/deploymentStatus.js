export default async function handler(req, res) {
  try {

    const { deploymentId } = req.query;

    if (!deploymentId) {
      return res.status(400).json({ error: "Missing deploymentId" });
    }

    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    return res.status(200).json({
      status: data.readyState,
      url: data.url,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}