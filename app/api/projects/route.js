import { getUserFromRequest } from "@/lib/auth";
import {
  createProjectForUser,
  listProjectsForUser,
} from "@/lib/services/projects";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projects = await listProjectsForUser(user.id);
  return Response.json({ projects });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, description } = await request.json().catch(() => ({}));
  if (!name) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }
  const project = await createProjectForUser(user.id, { name, description });
  return Response.json({ project });
}
