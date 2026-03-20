export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { projectName } = req.body;

    if (!projectName) {
      return res.status(400).json({
        error: "projectName required",
      });
    }

    // -------------------------
    // Delete project from Vercel
    // -------------------------
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();

      console.error("Delete error:", data);

      return res.status(500).json({
        error: "Failed to delete project on Vercel",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted from Vercel",
    });
  } catch (err) {
    console.error("Delete crash:", err);

    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}