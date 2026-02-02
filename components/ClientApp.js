"use client";

import AdminPortal from "@/components/AdminPortal";
import ProjectList from "@/components/ProjectList";
import IssueList from "@/components/IssueList";
import IssueDetail from "@/components/IssueDetail";
import SignedOutScreen from "@/components/SignedOutScreen";
import AppHeader from "@/components/AppHeader";
import ErrorBanner from "@/components/ErrorBanner";
import useBugTracker from "@/lib/client/useBugTracker";
import { isAdminEmail } from "@/lib/client/admin";

export default function ClientApp() {
  const {
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
  } = useBugTracker();

  if (!token || !user) {
    return <SignedOutScreen onAuth={handleAuth} />;
  }

  if (isAdminEmail(user.email)) {
    return <AdminPortal />;
  }

  return (
    <div className="page">
      <AppHeader userName={user.name} onLogout={logout} />
      <ErrorBanner error={error} onClear={() => setError("")} />
      <div className="grid">
        <ProjectList
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={(id) => setSelectedProjectId(id)}
          onCreate={createProject}
          loading={loadingProjects}
        />
        <IssueList
          issues={filteredIssues}
          project={selectedProject}
          selectedId={selectedIssueId}
          onSelect={(id) => setSelectedIssueId(id)}
          onCreate={createIssue}
          filters={issueFilters}
          onFilterChange={setIssueFilters}
          loading={loadingIssues}
          totalCount={issues.length}
        />
        <IssueDetail
          issue={selectedIssue}
          comments={comments}
          onAddComment={addComment}
        />
      </div>
    </div>
  );
}

