import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      setProject(data);
    };

    load();
  }, [id]);

  if (!project) return <p>Loading…</p>;

  return (
    <div style={{ padding: 32 }}>
      <h1>{project.name}</h1>

      <p>
        Repo: {project.repo_type} <br />
        Branch: {project.default_branch}
      </p>

      <div style={{ marginTop: 24 }}>
        <button>Deploy</button>
        <button style={{ marginLeft: 8 }}>Settings</button>
      </div>
    </div>
  );
}
