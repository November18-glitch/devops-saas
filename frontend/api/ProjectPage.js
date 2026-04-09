import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const fetchDeployments = async () => {
      const res = await fetch(`/api/getDeployments?projectId=${projectId}`);
      const data = await res.json();

      setDeployments(data.deployments || []);
    };

    fetchDeployments();
  }, [projectId]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>📂 Project</h1>

      <h3>Deployments</h3>

      {deployments.map((d) => (
        <div key={d.deployment_id} style={{ marginBottom: "20px" }}>
          <p>{d.deployment_id}</p>
          <p>Status: {d.status}</p>
          <div>{d.logs}</div>
        </div>
      ))}
    </div>
  );
}
console.log(projectId);