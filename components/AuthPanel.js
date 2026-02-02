"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client/api";
import { isAdminEmail } from "@/lib/client/admin";

export default function AuthPanel({ onAuth, onAdminLogin, onUserLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  const handleSuccess = (payload, emailOverride) => {
    onAuth(payload);
    const emailToCheck =
      emailOverride || payload.user?.email || email || "";
    if (isAdminEmail(emailToCheck)) {
      onAdminLogin?.(payload);
      return;
    }
    onUserLogin?.(payload);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const payload = await apiFetch(
        `/api/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(
            isRegister ? { name, email, password } : { email, password }
          ),
        }
      );
      handleSuccess(payload, email);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>{isRegister ? "Create account" : "Welcome back"}</h2>
      <form onSubmit={submit} className="stack">
        {isRegister && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label>
          Email
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegister ? "Register" : "Log in"}</button>
      </form>
      <button
        className="link"
        type="button"
        onClick={() => setMode(isRegister ? "login" : "register")}
      >
        {isRegister ? "Already have an account?" : "Need an account?"}
      </button>
    </div>
  );
}
