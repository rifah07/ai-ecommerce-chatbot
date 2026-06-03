import { NextRequest } from "next/server";
import { AppError, withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { authService } from "@/services/authService";
import { getRefreshToken } from "@/lib/auth/cookies";

export const POST = withErrorHandler(async (_request: NextRequest) => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new AppError("UNAUTHORIZED", "Refresh token not found");
  }

  const { accessToken } = await authService.refresh(refreshToken);

  const ACCESS_MAX_AGE = 60 * 15;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });

  return successResponse({ accessToken }, "Token refreshed");
});
