import { NextRequest } from "next/server";
import { getAccessToken } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/AppError";
import type { JWTPayload } from "@/types";

export async function requireAuth(_request: NextRequest): Promise<JWTPayload> {
  const token = await getAccessToken();

  if (!token) {
    throw new AppError("UNAUTHORIZED", "Authentication required");
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new AppError("UNAUTHORIZED", "Invalid or expired token");
  }

  return payload;
}
