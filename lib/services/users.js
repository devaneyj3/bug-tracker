import bcrypt from "bcryptjs";
import { get, run } from "../db";

export const findUserByEmail = async (email) =>
  get("SELECT id, name, email, password_hash FROM users WHERE email = ?", [
    email,
  ]);

export const getUserById = async (id) =>
  get("SELECT id, name, email FROM users WHERE id = ?", [id]);

export const createUser = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return { id: result.id, name, email };
};

export const ensureUserByEmail = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { id: existing.id, name: existing.name, email: existing.email };
  }
  return createUser({ name, email, password });
};
