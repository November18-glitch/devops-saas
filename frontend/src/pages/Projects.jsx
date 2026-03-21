const deployProject = async () => {
  try {
    const res = await fetch("/api/deployProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoUrl,
        projectName,
      }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("RAW RESPONSE:", text);
      alert("Server error");
      return;
    }

    if (!res.ok) {
      alert(data.error || "Deploy failed");
      return;
    }

    console.log("DEPLOYED:", data);

    // 🔥 START STATUS POLLING
    checkDeploymentStatus(data.deploymentId);

  } catch (err) {
    console.error(err);
  }
};

const checkDeploymentStatus = async (id) => {
  const interval = setInterval(async () => {
    const res = await fetch(`/api/deploymentStatus?deploymentId=${id}`);
    const data = await res.json();

    console.log("STATUS:", data);

    if (data.status === "READY") {
      clearInterval(interval);
      alert("✅ Deployment successful!");
    }

    if (data.status === "ERROR") {
      clearInterval(interval);
      alert("❌ Deployment failed");
    }

  }, 3000);
};