import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { AppError } from "@/lib/utils/AppError";
import type { UserRole, JWTPayload } from "@/types";

export async function requireRole(
  request: NextRequest,
  role: UserRole,
): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (user.role !== role) {
    throw new AppError("UNAUTHORIZED", `Access denied. Required role: ${role}`);
  }
  return user;
}
