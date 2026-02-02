"use client";

export default function AppHeader({ userName, onLogout }) {
  return (
    <header className="header-row">
      <div>
        <h1>Bug Tracker MVP</h1>
        <p className="muted">Signed in as {userName}</p>
      </div>
      <button onClick={onLogout} className="link">
        Log out
      </button>
    </header>
  );
}
