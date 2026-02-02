"use client";

import { useState } from "react";

export default function IssueList({
  issues,
  project,
  selectedId,
  onSelect,
  onCreate,
  filters,
  onFilterChange,
  loading,
  totalCount,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    onCreate({
      title: title.trim(),
      description: description.trim() || null,
      priority,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  if (!project) {
    return (
      <div className="card">
        <h3>Issues</h3>
        <p className="muted">Select a project to view issues.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="header-title">
          <h3>Issues for {project.name}</h3>
          <span className="badge">
            {issues.length}/{totalCount}
          </span>
        </div>
      </div>
      <div className="filter-row">
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) =>
              onFilterChange({ ...filters, status: event.target.value })
            }
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label>
          Priority
          <select
            value={filters.priority}
            onChange={(event) =>
              onFilterChange({ ...filters, priority: event.target.value })
            }
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          Sort
          <select
            value={filters.sort}
            onChange={(event) =>
              onFilterChange({ ...filters, sort: event.target.value })
            }
          >
            <option value="newest">Newest</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
      <ul className="list">
        {loading && <li className="muted">Loading issues...</li>}
        {!loading && issues.length === 0 && (
          <li className="muted">No issues yet.</li>
        )}
        {issues.map((issue) => (
          <li key={issue.id}>
            <button
              className={`list-button ${
                selectedId === issue.id ? "active" : ""
              }`}
              onClick={() => onSelect(issue.id)}
            >
              <div className="list-row">
                <span>{issue.title}</span>
                <span className={`pill status-${issue.status}`}>
                  {issue.status}
                </span>
              </div>
              <small className="muted">Priority: {issue.priority}</small>
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="stack compact">
        <input
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          rows="3"
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="row">
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit">Add issue</button>
      </form>
    </div>
  );
}
