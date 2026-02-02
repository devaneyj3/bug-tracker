"use client";

import { useEffect, useMemo, useState } from "react";
import AuthPanel from "@/components/AuthPanel";
import AdminPortal from "@/components/AdminPortal";
import { apiFetch, storageKey } from "@/lib/client/api";
import { isAdminEmail } from "@/lib/client/admin";

const ProjectList = ({
  projects,
  selectedId,
  onSelect,
  onCreate,
  loading,
}) => {
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
        <h3>Projects</h3>
        {loading && <span className="muted">Loading...</span>}
      </div>
      <ul className="list">
        {projects.length === 0 && <li className="muted">No projects yet.</li>}
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
};

const IssueList = ({
  issues,
  project,
  selectedId,
  onSelect,
  onCreate,
}) => {
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
        <h3>Issues for {project.name}</h3>
      </div>
      <ul className="list">
        {issues.length === 0 && <li className="muted">No issues yet.</li>}
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
};

const IssueDetail = ({ issue, comments, onStatus, onAddComment }) => {
  const [text, setText] = useState("");

  if (!issue) {
    return (
      <div className="card">
        <h3>Issue details</h3>
        <p className="muted">Select an issue to view details.</p>
      </div>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    onAddComment(text.trim());
    setText("");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{issue.title}</h3>
        <span className={`pill status-${issue.status}`}>{issue.status}</span>
      </div>
      {issue.description && <p>{issue.description}</p>}
      <p className="muted">Priority: {issue.priority}</p>
      <div className="section">
        <h4>Comments</h4>
        {comments.length === 0 && <p className="muted">No comments yet.</p>}
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <div className="comment-header">
                <strong>{comment.user_name}</strong>
                <span className="muted">{comment.created_at}</span>
              </div>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="stack compact">
          <textarea
            placeholder="Add a comment"
            rows="3"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Post comment</button>
        </form>
      </div>
    </div>
  );
};

export default function ClientApp() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [error, setError] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  const resetIssueSelection = () => {
    setSelectedIssueId(null);
    setComments([]);
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const payload = await apiFetch("/api/projects", {}, token);
      setProjects(payload.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadIssues = async (projectId) => {
    try {
      const payload = await apiFetch(
        `/api/projects/${projectId}/issues`,
        {},
        token
      );
      setIssues(payload.issues);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadComments = async (issueId) => {
    try {
      const payload = await apiFetch(
        `/api/issues/${issueId}/comments`,
        {},
        token
      );
      setComments(payload.comments);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuth = (payload) => {
    localStorage.setItem(storageKey, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setToken(null);
    setUser(null);
    setProjects([]);
    setIssues([]);
    setComments([]);
    setSelectedProjectId(null);
    setSelectedIssueId(null);
    setError("");
  };

  const createProject = async (data) => {
    try {
      const payload = await apiFetch(
        "/api/projects",
        { method: "POST", body: JSON.stringify(data) },
        token
      );
      setProjects([payload.project, ...projects]);
      setSelectedProjectId(payload.project.id);
      setIssues([]);
      setComments([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const createIssue = async (data) => {
    if (!selectedProjectId) {
      return;
    }
    try {
      const payload = await apiFetch(
        `/api/projects/${selectedProjectId}/issues`,
        { method: "POST", body: JSON.stringify(data) },
        token
      );
      setIssues([payload.issue, ...issues]);
      setSelectedIssueId(payload.issue.id);
      setComments([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateIssueStatus = async (status) => {
    if (!selectedIssueId) {
      return;
    }
    try {
      const payload = await apiFetch(
        `/api/issues/${selectedIssueId}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token
      );
      setIssues(
        issues.map((issue) =>
          issue.id === selectedIssueId ? payload.issue : issue
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const addComment = async (body) => {
    if (!selectedIssueId) {
      return;
    }
    try {
      const payload = await apiFetch(
        `/api/issues/${selectedIssueId}/comments`,
        { method: "POST", body: JSON.stringify({ body }) },
        token
      );
      setComments([...comments, payload.comment]);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    apiFetch("/api/me", {}, token)
      .then((payload) => setUser(payload.user))
      .catch(() => {
        logout();
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadProjects();
  }, [token]);

  useEffect(() => {
    if (!selectedProjectId) {
      setIssues([]);
      resetIssueSelection();
      return;
    }
    loadIssues(selectedProjectId);
    resetIssueSelection();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedIssueId) {
      setComments([]);
      return;
    }
    loadComments(selectedIssueId);
  }, [selectedIssueId]);

  if (!token || !user) {
    return (
      <div className="page">
        <header>
          <h1>Bug Tracker MVP</h1>
          <p className="muted">
            Track issues across projects and collaborate with comments.
          </p>
        </header>
        <AuthPanel onAuth={handleAuth} />
      </div>
    );
  }

  if (isAdminEmail(user.email)) {
    return <AdminPortal />;
  }

  return (
    <div className="page">
      <header className="header-row">
        <div>
          <h1>Bug Tracker MVP</h1>
          <p className="muted">Signed in as {user.name}</p>
        </div>
        <button onClick={logout} className="link">
          Log out
        </button>
      </header>
      {error && (
        <div className="card error-banner">
          <span>{error}</span>
          <button className="link" onClick={() => setError("")}>
            Clear
          </button>
        </div>
      )}
      <div className="grid">
        <ProjectList
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={(id) => setSelectedProjectId(id)}
          onCreate={createProject}
          loading={loadingProjects}
        />
        <IssueList
          issues={issues}
          project={selectedProject}
          selectedId={selectedIssueId}
          onSelect={(id) => setSelectedIssueId(id)}
          onCreate={createIssue}
        />
        <IssueDetail
          issue={selectedIssue}
          comments={comments}
          onStatus={updateIssueStatus}
          onAddComment={addComment}
        />
      </div>
    </div>
  );
}

