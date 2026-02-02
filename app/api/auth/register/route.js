import { createToken } from "@/lib/auth";
import { findUserByEmail, createUser } from "@/lib/services/users";

export const runtime = "nodejs";

export async function POST(request) {
  const { name, email, password } = await request.json().catch(() => ({}));
  if (!name || !email || !password) {
    return Response.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }
  const user = await createUser({ name, email, password });
  return Response.json({ token: createToken(user), user });
}
