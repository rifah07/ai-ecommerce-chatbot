import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { authService } from "@/services/authService";
import { RegisterSchema } from "@/validators/authValidators";

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const, // "lax" works for same-site navigation; "strict" can block post-redirect reads
  path: "/",
};

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const input = RegisterSchema.parse(body);

  const { user, tokens } = await authService.register(input);

  const response = NextResponse.json(
    { success: true, data: { user }, message: "Account created successfully" },
    { status: 201 },
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
