import { getUserFromRequest, isAdminUser } from "@/lib/auth";
import {
  addCommentToIssue,
  listCommentsForIssue,
} from "@/lib/services/comments";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const issueId = Number(params.issueId);
  if (!Number.isInteger(issueId)) {
    return Response.json({ error: "Invalid issue id" }, { status: 400 });
  }
  const comments = await listCommentsForIssue(issueId);
  return Response.json({ comments });
}

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const issueId = Number(params.issueId);
  if (!Number.isInteger(issueId)) {
    return Response.json({ error: "Invalid issue id" }, { status: 400 });
  }
  const { body } = await request.json().catch(() => ({}));
  if (!body) {
    return Response.json({ error: "Comment body is required" }, { status: 400 });
  }
  const comment = await addCommentToIssue(issueId, user.id, body);
  return Response.json({ comment });
}
