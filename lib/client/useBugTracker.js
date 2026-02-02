"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, storageKey } from "@/lib/client/api";

export default function useBugTracker() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [error, setError] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issueFilters, setIssueFilters] = useState({
    status: "all",
    priority: "all",
    sort: "newest",
  });

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
    setLoadingIssues(true);
    try {
      const payload = await apiFetch(
        `/api/projects/${projectId}/issues`,
        {},
        token
      );
      setIssues(payload.issues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingIssues(false);
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
      setLoadingIssues(false);
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

  const filteredIssues = useMemo(() => {
    const byStatus =
      issueFilters.status === "all"
        ? issues
        : issues.filter((issue) => issue.status === issueFilters.status);
    const byPriority =
      issueFilters.priority === "all"
        ? byStatus
        : byStatus.filter((issue) => issue.priority === issueFilters.priority);
    const sorted = [...byPriority];
    if (issueFilters.sort === "priority") {
      const rank = { high: 3, medium: 2, low: 1 };
      sorted.sort(
        (a, b) => (rank[b.priority] || 0) - (rank[a.priority] || 0)
      );
    }
    if (issueFilters.sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [issues, issueFilters]);

  return {
    token,
    user,
    projects,
    issues,
    comments,
    selectedProject,
    selectedProjectId,
    selectedIssue,
    selectedIssueId,
    error,
    loadingProjects,
    loadingIssues,
    filteredIssues,
    issueFilters,
    handleAuth,
    logout,
    createProject,
    createIssue,
    addComment,
    setError,
    setIssueFilters,
    setSelectedProjectId,
    setSelectedIssueId,
  };
}
