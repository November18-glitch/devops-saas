import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const { id } = useParams();

  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    const fetchDeployments = async () => {
      const res = await fetch(`/api/getDeployments?projectId=${id}`);
      const data = await res.json();
      setDeployments(data.deployments || []);
    };

    fetchDeployments();
  }, [id]);

  return (
    <div style={{ padding: 40 }}>
      <h1>📦 Project {id}</h1>

      {deployments.map((d) => (
        <div key={d.deployment_id} style={{ marginTop: 10 }}>
          <p>{d.deployment_id}</p>
          <p>Status: {d.status}</p>
          <p>{d.logs}</p>
        </div>
      ))}
    </div>
  );
}