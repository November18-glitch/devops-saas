import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CreateProjectModal({ teamId, onClose, onCreated }) {
  const [name, setName] = useState("");

  const createProject = async () => {
    const { error } = await supabase.from("projects").insert({
      name,
      repo_type: "github",
      default_branch: "main",
      team_id: teamId,
    });

    if (!error) {
      onCreated();
      onClose();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>New Project</h3>

        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={createProject}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "white",
    padding: 20,
    borderRadius: 6,
    width: 300,
  },
};
