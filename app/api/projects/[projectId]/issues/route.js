import { getUserFromRequest } from "@/lib/auth";
import { ensureProjectOwner } from "@/lib/ownership";
import {
  createIssueForProject,
  listIssuesForProject,
} from "@/lib/services/issues";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projectId = Number(params.projectId);
  if (!Number.isInteger(projectId)) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }
  const project = await ensureProjectOwner(projectId, user.id);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  const issues = await listIssuesForProject(projectId);
  return Response.json({ project, issues });
}

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projectId = Number(params.projectId);
  if (!Number.isInteger(projectId)) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }
  const { title, description, priority } = await request.json().catch(() => ({}));
  if (!title) {
    return Response.json({ error: "Issue title is required" }, { status: 400 });
  }
  const project = await ensureProjectOwner(projectId, user.id);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  const issue = await createIssueForProject(projectId, user.id, {
    title,
    description,
    priority,
  });
  return Response.json({ issue });
}
