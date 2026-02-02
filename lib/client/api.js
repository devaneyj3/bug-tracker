"use client";

export const storageKey = "bug_tracker_token";

export const apiFetch = async (path, options = {}, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error || "Request failed";
    throw new Error(message);
  }
  return payload;
};
