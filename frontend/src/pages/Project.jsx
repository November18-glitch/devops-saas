import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Project() {
  const { id } = useParams();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await fetch(`/api/getDeployments?projectId=${id}`);
        const data = await res.json();

        setDeployments(
          data.deployments.map((d) => ({
            id: d.deployment_id,
            status: d.status,
            url: d.url || null,
            logs: d.logs || "",
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDeployments();
  }, [id]);

  return (
    <div style={{ padding: "40px" }}>
      <h1>📦 Project</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        deployments.map((d) => (
          <div
            key={d.id}
            style={{
              background: "#1e293b",
              color: "white",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px",
            }}
          >
            <p>{d.id}</p>
            <p>Status: {d.status}</p>

            <div
              style={{
                background: "#020617",
                padding: "10px",
                marginTop: "10px",
                fontSize: "12px",
              }}
            >
              {d.logs}
            </div>

            {d.url && (
              <a href={`https://${d.url}`} target="_blank">
                🌍 Open
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}