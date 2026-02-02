"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, storageKey } from "@/lib/client/api";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  const normalized =
    typeof value === "string" ? value.replace(" ", "T") : value;
  const parsed =
    typeof normalized === "string" && !normalized.endsWith("Z")
      ? new Date(`${normalized}Z`)
      : new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsed);
};

export default function AdminPortal() {
  const [token, setToken] = useState(null);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalIssueId, setModalIssueId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [commentsByIssue, setCommentsByIssue] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const rows = useMemo(
    () =>
      issues.map((issue) => ({
        ...issue,
        reporter: issue.reporter_name || "Unknown",
        reporterEmail: issue.reporter_email || "Unknown",
      })),
    [issues]
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      window.location.href = "/";
      return;
    }
    setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    setLoading(true);
    apiFetch("/api/admin/issues", {}, token)
      .then((payload) => setIssues(payload.issues))
      .catch((err) => {
        setError(err.message);
        if (err.message === "Unauthorized" || err.message === "Forbidden") {
          localStorage.removeItem(storageKey);
          window.location.href = "/";
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const logout = () => {
    localStorage.removeItem(storageKey);
    setToken(null);
    setIssues([]);
    setError("");
    setModalIssueId(null);
    window.location.href = "/";
  };

  const updateStatus = async (issueId, status) => {
    if (!token) {
      return;
    }
    setError("");
    setUpdatingId(issueId);
    try {
      const payload = await apiFetch(
        `/api/admin/issues/${issueId}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token
      );
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, status: payload.issue.status } : issue
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const loadComments = async (issueId) => {
    if (!token || loadingComments[issueId]) {
      return;
    }
    setLoadingComments((prev) => ({ ...prev, [issueId]: true }));
    try {
      const payload = await apiFetch(
        `/api/admin/issues/${issueId}/comments`,
        {},
        token
      );
      setCommentsByIssue((prev) => ({ ...prev, [issueId]: payload.comments }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  useEffect(() => {
    if (!modalIssueId || commentsByIssue[modalIssueId]) {
      return;
    }
    loadComments(modalIssueId);
  }, [modalIssueId, token]);

  const selectedIssue = useMemo(
    () => rows.find((issue) => issue.id === modalIssueId) || null,
    [rows, modalIssueId]
  );

  const addComment = async (issueId) => {
    const body = (commentDrafts[issueId] || "").trim();
    if (!body || !token) {
      return;
    }
    setError("");
    setLoadingComments((prev) => ({ ...prev, [issueId]: true }));
    try {
      const payload = await apiFetch(
        `/api/admin/issues/${issueId}/comments`,
        { method: "POST", body: JSON.stringify({ body }) },
        token
      );
      setCommentsByIssue((prev) => ({
        ...prev,
        [issueId]: [...(prev[issueId] || []), payload.comment],
      }));
      setCommentDrafts((prev) => ({ ...prev, [issueId]: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [issueId]: false }));
    }
  };

  const deleteTicket = async (issueId) => {
    if (!token) {
      return;
    }
    setError("");
    setDeletingId(issueId);
    try {
      await apiFetch(
        `/api/admin/issues/${issueId}`,
        { method: "DELETE" },
        token
      );
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
      setCommentsByIssue((prev) => {
        const next = { ...prev };
        delete next[issueId];
        return next;
      });
      setCommentDrafts((prev) => {
        const next = { ...prev };
        delete next[issueId];
        return next;
      });
      setModalIssueId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page admin-page">
      <header className="header-row">
        <div>
          <h1>Admin Portal</h1>
          <p className="muted">All reported issues and reporters.</p>
        </div>
        {token && (
          <button className="link" type="button" onClick={logout}>
            Log out
          </button>
        )}
      </header>
      {error && (
        <div className="card error-banner">
          <span>{error}</span>
          <button className="link" onClick={() => setError("")}>
            Clear
          </button>
        </div>
      )}
      <div className="card admin-card">
        {loading ? (
          <p className="muted">Loading issues...</p>
        ) : (
          <div className="admin-table">
            <div className="admin-row admin-head">
              <span>Issue</span>
              <span>Project</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Reporter</span>
            </div>
            {rows.length === 0 && (
              <p className="muted admin-empty">No issues found.</p>
            )}
            {rows.map((issue) => {
              return (
                <div key={issue.id} className="admin-item">
                  <div
                    className="admin-row"
                    role="button"
                    tabIndex={0}
                    onClick={() => setModalIssueId(issue.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setModalIssueId(issue.id);
                      }
                    }}
                    aria-expanded={modalIssueId === issue.id}
                  >
                    <div>
                      <strong>{issue.title}</strong>
                      <div className="muted admin-sub">
                        Created {formatDateTime(issue.created_at)}
                      </div>
                      <div className="muted admin-sub">View details</div>
                    </div>
                    <span>{issue.project_name}</span>
                    <select
                      className="admin-status"
                      value={issue.status}
                      disabled={updatingId === issue.id}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        event.stopPropagation();
                        updateStatus(issue.id, event.target.value);
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="closed">Closed</option>
                    </select>
                    <span className="pill">{issue.priority}</span>
                    <div>
                      <strong>{issue.reporter}</strong>
                      <div className="muted admin-sub">
                        {issue.reporterEmail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedIssue && (
        <div
          className="admin-modal-overlay"
          onClick={() => setModalIssueId(null)}
          role="presentation"
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div>
                <h2>{selectedIssue.title}</h2>
                <p className="muted">
                  Created {formatDateTime(selectedIssue.created_at)}
                </p>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="link danger"
                  type="button"
                  onClick={() => deleteTicket(selectedIssue.id)}
                  disabled={deletingId === selectedIssue.id}
                >
                  {deletingId === selectedIssue.id ? "Deleting..." : "Delete"}
                </button>
                <button
                  className="link"
                  type="button"
                  onClick={() => setModalIssueId(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="admin-details-grid">
              <div>
                <strong>Project</strong>
                <p className="admin-desc">{selectedIssue.project_name}</p>
              </div>
              <div>
                <strong>Status</strong>
                <select
                  className="admin-status"
                  value={selectedIssue.status}
                  disabled={updatingId === selectedIssue.id}
                  onChange={(event) =>
                    updateStatus(selectedIssue.id, event.target.value)
                  }
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <strong>Priority</strong>
                <p className="admin-desc">{selectedIssue.priority}</p>
              </div>
              <div>
                <strong>Reporter</strong>
                <p className="admin-desc">
                  {selectedIssue.reporter} • {selectedIssue.reporterEmail}
                </p>
              </div>
              <div>
                <strong>Last updated</strong>
                <p className="admin-desc">
                  {formatDateTime(selectedIssue.updated_at)}
                </p>
              </div>
              <div>
                <strong>Description</strong>
                <p className="admin-desc">
                  {selectedIssue.description || "No description provided."}
                </p>
              </div>
            </div>
            <div className="admin-comments">
              <strong>Comments</strong>
              {loadingComments[selectedIssue.id] && (
                <p className="muted admin-sub">Loading comments...</p>
              )}
              {(commentsByIssue[selectedIssue.id] || []).length === 0 &&
                !loadingComments[selectedIssue.id] && (
                  <p className="muted admin-sub">No comments yet.</p>
                )}
              <ul className="comment-list admin-comment-list">
                {(commentsByIssue[selectedIssue.id] || []).map((comment) => (
                  <li key={comment.id}>
                    <div className="comment-header">
                      <strong>{comment.user_name}</strong>
                      <span className="muted">
                        {formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <p>{comment.body}</p>
                  </li>
                ))}
              </ul>
              <div className="stack compact">
                <textarea
                  placeholder="Write a response..."
                  rows="3"
                  value={commentDrafts[selectedIssue.id] || ""}
                  onChange={(event) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [selectedIssue.id]: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => addComment(selectedIssue.id)}
                  disabled={loadingComments[selectedIssue.id]}
                >
                  Respond
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
