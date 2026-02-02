"use client";

import AuthPanel from "@/components/AuthPanel";

export default function SignedOutScreen({ onAuth }) {
  return (
    <div className="page">
      <header>
        <h1>Bug Tracker MVP</h1>
        <p className="muted">
          Track issues across projects and collaborate with comments.
        </p>
      </header>
      <AuthPanel onAuth={onAuth} />
    </div>
  );
}
