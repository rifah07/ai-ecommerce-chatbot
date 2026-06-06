import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, AppError } from "@/lib/utils/AppError";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    throw new AppError("UNAUTHORIZED", "Refresh token missing");
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError("UNAUTHORIZED", "Invalid or expired refresh token");
  }

  await connectDB();
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError("UNAUTHORIZED", "User no longer exists");
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const response = NextResponse.json(
    { success: true, data: { accessToken }, message: "Token refreshed" },
    { status: 200 },
  );

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return response;
});
