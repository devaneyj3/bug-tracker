import { getUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ user });
}
