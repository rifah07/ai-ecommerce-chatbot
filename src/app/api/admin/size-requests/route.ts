import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { adminService } from "@/services/adminService";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireRole(request, "ADMIN");
  const requests = await adminService.getAllSizeRequests();
  return successResponse(requests);
});
