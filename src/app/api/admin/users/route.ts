import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  ApiError,
  handleApiError,
  parseJsonBody,
  successResponse,
} from "@/lib/api-utils";
import { adminUserSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }
    return successResponse(
      await prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new ApiError(403, "Forbidden");
    }
    const data = adminUserSchema
      .required({ password: true })
      .parse(await parseJsonBody(request));
    return successResponse(
      await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          role: data.role,
          passwordHash: await bcrypt.hash(data.password, 12),
        },
        select: { id: true, email: true, name: true, role: true },
      }),
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
