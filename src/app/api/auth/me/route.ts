import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireAuth } from "@/lib/auth/requireAuth";
import { authService } from "@/services/authService";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { userId } = await requireAuth(request);
  const user = await authService.getMe(userId);
  return successResponse({ user });
});
