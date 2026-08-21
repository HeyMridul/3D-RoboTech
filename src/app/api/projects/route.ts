import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/api-utils";
import { getProjects } from "@/server/services/content";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const projects = await getProjects({ category, search });
    return successResponse(projects);
  } catch (error) {
    return handleApiError(error);
  }
}
