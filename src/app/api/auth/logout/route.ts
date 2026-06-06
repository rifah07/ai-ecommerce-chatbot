import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";

export const POST = withErrorHandler(async (_request: NextRequest) => {
  const response = NextResponse.json(
    { success: true, data: null, message: "Logged out successfully" },
    { status: 200 },
  );

  // Clear both cookies by setting maxAge to 0
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
});
