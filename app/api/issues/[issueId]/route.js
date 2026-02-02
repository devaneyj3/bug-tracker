import { getUserFromRequest } from "@/lib/auth";
import { ensureIssueOwnership } from "@/lib/ownership";
import { updateIssue } from "@/lib/services/issues";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const issueId = Number(params.issueId);
  if (!Number.isInteger(issueId)) {
    return Response.json({ error: "Invalid issue id" }, { status: 400 });
  }
  const issue = await ensureIssueOwnership(issueId, user.id);
  if (!issue) {
    return Response.json({ error: "Issue not found" }, { status: 404 });
  }
  const updates = await request.json().catch(() => ({}));
  const updated = await updateIssue(issueId, updates);
  if (!updated) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }
  return Response.json({ issue: updated });
}
