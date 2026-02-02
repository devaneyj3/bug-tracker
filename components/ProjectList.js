"use client";

import { useState } from "react";

export default function ProjectList({
  projects,
  selectedId,
  onSelect,
  onCreate,
  loading,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    onCreate({ name: name.trim(), description: description.trim() || null });
    setName("");
    setDescription("");
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="header-title">
          <h3>Projects</h3>
          <span className="badge">{projects.length}</span>
        </div>
        {loading && <span className="muted">Loading...</span>}
      </div>
      <ul className="list">
        {projects.length === 0 && !loading && (
          <li className="muted">No projects yet.</li>
        )}
        {projects.map((project) => (
          <li key={project.id}>
            <button
              className={`list-button ${
                selectedId === project.id ? "active" : ""
              }`}
              onClick={() => onSelect(project.id)}
            >
              <span>{project.name}</span>
              {project.description && (
                <small className="muted">{project.description}</small>
              )}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="stack compact">
        <input
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add project</button>
      </form>
    </div>
  );
}
