import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Project() {
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
    <div style={{ padding: "40px", background: "#0f172a", color: "white" }}>
      <h1>📦 Project Deployments</h1>

      {deployments.length === 0 ? (
        <p>No deployments yet</p>
      ) : (
        deployments.map((d) => (
          <div key={d.deployment_id} style={{
            background: "#1e293b",
            padding: "20px",
            marginTop: "10px"
          }}>
            <p><strong>ID:</strong> {d.deployment_id}</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p>{d.logs}</p>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank">
                🔗 Open Deployment
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}