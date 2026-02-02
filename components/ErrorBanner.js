"use client";

export default function ErrorBanner({ error, onClear }) {
  if (!error) {
    return null;
  }

  return (
    <div className="card error-banner">
      <span>{error}</span>
      <button className="link" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
