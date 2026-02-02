import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { findUserByEmail } from "@/lib/services/users";

export const runtime = "nodejs";

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }
  const user = await findUserByEmail(email);
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return Response.json({
    token: createToken(user),
    user: { id: user.id, name: user.name, email: user.email },
  });
}
