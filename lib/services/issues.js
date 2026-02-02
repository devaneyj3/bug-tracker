import { all, get, run } from "../db";

export const listIssuesForProject = async (projectId) =>
  all(
    `SELECT id, title, description, status, priority, created_at, updated_at
     FROM issues
     WHERE project_id = ?
     ORDER BY created_at DESC`,
    [projectId]
  );

export const createIssueForProject = async (projectId, userId, data) => {
  const result = await run(
    `INSERT INTO issues (project_id, created_by_user_id, title, description, priority)
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, userId, data.title, data.description || null, data.priority || "medium"]
  );
  return get(
    `SELECT id, title, description, status, priority, created_at, updated_at
     FROM issues WHERE id = ?`,
    [result.id]
  );
};

export const updateIssue = async (issueId, updates) => {
  const fields = [];
  const params = [];
  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    params.push(updates.description);
  }
  if (updates.status !== undefined) {
    fields.push("status = ?");
    params.push(updates.status);
  }
  if (updates.priority !== undefined) {
    fields.push("priority = ?");
    params.push(updates.priority);
  }
  if (fields.length === 0) {
    return null;
  }
  fields.push("updated_at = datetime('now')");
  params.push(issueId);
  await run(`UPDATE issues SET ${fields.join(", ")} WHERE id = ?`, params);
  return get(
    `SELECT id, title, description, status, priority, created_at, updated_at
     FROM issues WHERE id = ?`,
    [issueId]
  );
};

export const listAdminIssues = async () =>
  all(
    `SELECT issues.id, issues.title, issues.status, issues.priority,
            issues.description, issues.created_at, issues.updated_at,
            projects.name AS project_name,
            users.name AS reporter_name,
            users.email AS reporter_email
     FROM issues
     INNER JOIN projects ON projects.id = issues.project_id
     LEFT JOIN users ON users.id = issues.created_by_user_id
     ORDER BY issues.created_at DESC`
  );

export const deleteIssue = async (issueId) => {
  const existing = await get("SELECT id FROM issues WHERE id = ?", [issueId]);
  if (!existing) {
    return false;
  }
  await run("DELETE FROM issues WHERE id = ?", [issueId]);
  return true;
};
