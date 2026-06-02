import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { AppError } from "@/lib/utils/AppError";
import type { UserRole, JWTPayload } from "@/types";

/**
 * Usage:
 *   const user = await requireRole(request, "ADMIN");
 *   const user = await requireRole(request, "CUSTOMER");
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole | UserRole[]
): Promise<JWTPayload> {
  const user = await requireAuth(request);
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!rolesArray.includes(user.role)) {
    throw new AppError(
      "UNAUTHORIZED",
      `Access denied. Requires one of these roles: ${rolesArray.join(", ")}`
    );
  }

  return user;
}