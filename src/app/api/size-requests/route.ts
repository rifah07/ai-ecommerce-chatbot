import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { sizeRequestService } from "@/services/sizeRequestService";

/**
 * GET /api/size-requests
 * Returns the authenticated customer's own size requests.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const requests = await sizeRequestService.getUserRequests(user.userId);
  return successResponse(requests);
});
