import jwt from "jsonwebtoken";
import { getUserById } from "./services/users";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

export const getUserFromRequest = async (request) => {
  const header = request.headers.get("authorization") || "";
  const [, token] = header.split(" ");
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.id);
    return user || null;
  } catch (err) {
    return null;
  }
};

export const isAdminUser = (user) => {
  const allowList = process.env.ADMIN_EMAILS || "";
  if (!allowList.trim()) {
    return true;
  }
  const allowed = allowList
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(user.email.toLowerCase());
};
