import { get } from "./db";

export const ensureProjectOwner = async (projectId, userId) => {
  const project = await get(
    "SELECT id, owner_user_id, name, description FROM projects WHERE id = ?",
    [projectId]
  );
  if (!project || project.owner_user_id !== userId) {
    return null;
  }
  return project;
};

export const ensureIssueOwnership = async (issueId, userId) => {
  const issue = await get(
    `SELECT issues.id, issues.project_id
     FROM issues
     INNER JOIN projects ON projects.id = issues.project_id
     WHERE issues.id = ? AND projects.owner_user_id = ?`,
    [issueId, userId]
  );
  return issue || null;
};
