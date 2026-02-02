import { all, get, run } from "../db";

export const listProjectsForUser = async (userId) =>
  all(
    `SELECT id, name, description, created_at
     FROM projects
     WHERE owner_user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

export const createProjectForUser = async (userId, { name, description }) => {
  const result = await run(
    "INSERT INTO projects (owner_user_id, name, description) VALUES (?, ?, ?)",
    [userId, name, description || null]
  );
  return get(
    "SELECT id, name, description, created_at FROM projects WHERE id = ?",
    [result.id]
  );
};
