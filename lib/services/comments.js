import { all, get, run } from "../db";

export const listCommentsForIssue = async (issueId) =>
  all(
    `SELECT comments.id, comments.body, comments.created_at,
            users.id AS user_id, users.name AS user_name
     FROM comments
     INNER JOIN users ON users.id = comments.user_id
     WHERE comments.issue_id = ?
     ORDER BY comments.created_at ASC`,
    [issueId]
  );

export const addCommentToIssue = async (issueId, userId, body) => {
  const result = await run(
    "INSERT INTO comments (issue_id, user_id, body) VALUES (?, ?, ?)",
    [issueId, userId, body]
  );
  return get(
    `SELECT comments.id, comments.body, comments.created_at,
            users.id AS user_id, users.name AS user_name
     FROM comments
     INNER JOIN users ON users.id = comments.user_id
     WHERE comments.id = ?`,
    [result.id]
  );
};
