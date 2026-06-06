import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/AppError";
import type { JWTPayload } from "@/types";

/**
 * Reads accessToken directly from the incoming request cookies.
 * This is the correct approach for Next.js 15 Route Handlers.
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    throw new AppError("UNAUTHORIZED", "Authentication required");
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new AppError("UNAUTHORIZED", "Invalid or expired token");
  }

  return payload;
}
