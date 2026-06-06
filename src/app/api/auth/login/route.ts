import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { authService } from "@/services/authService";
import { LoginSchema } from "@/validators/authValidators";

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const input = LoginSchema.parse(body);

  const { user, tokens } = await authService.login(input);

  const response = NextResponse.json(
    { success: true, data: { user }, message: "Logged in successfully" },
    { status: 200 },
  );

  response.cookies.set("accessToken", tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });

  return response;
});
