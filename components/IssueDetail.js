"use client";

import { useState } from "react";

export default function IssueDetail({ issue, comments, onAddComment }) {
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
}
