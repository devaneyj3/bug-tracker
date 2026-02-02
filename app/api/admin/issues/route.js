import { getUserFromRequest, isAdminUser } from "@/lib/auth";
import { listAdminIssues } from "@/lib/services/issues";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const issues = await listAdminIssues();
  return Response.json({ issues });
}
