import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { clearAuthCookies } from "@/lib/auth/cookies";

export const POST = withErrorHandler(async (_request: NextRequest) => {
    clearAuthCookies();
    return successResponse(null, "Logged out successfully");
});
