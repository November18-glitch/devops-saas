import { Link } from "react-router-dom";
import "../styles/dashboard.css";

export default function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-5 cursor-pointer hover:shadow-md transition bg-white"
    >
      <h3 className="text-lg font-semibold mb-1">
        {project.name}
      </h3>

      <p className="text-sm text-gray-500 mb-2">
        {project.repo_type || "No repo connected"}
      </p>

      <div className="text-xs text-gray-400">
        Default branch: {project.default_branch || "—"}
      </div>
    </div>
  );
}
