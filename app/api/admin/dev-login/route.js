import crypto from "crypto";
import { createToken } from "@/lib/auth";
import { ensureUserByEmail } from "@/lib/services/users";

export const runtime = "nodejs";

export async function POST() {
  if (process.env.ADMIN_DEV_LOGIN !== "true") {
    return Response.json({ error: "Dev login disabled" }, { status: 403 });
  }
  const email = process.env.ADMIN_DEV_EMAIL || "dev-admin@example.com";
  const name = process.env.ADMIN_DEV_NAME || "Dev Admin";
  const tempPassword = crypto.randomBytes(16).toString("hex");
  const user = await ensureUserByEmail({
    name,
    email,
    password: tempPassword,
  });
  return Response.json({ token: createToken(user), user });
}
