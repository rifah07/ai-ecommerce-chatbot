import { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/AppError";
import { connectDB } from "@/lib/db/connect";
import type { JWTPayload } from "@/types";

/**
 * Reads accessToken from the request cookies.
 * If expired, automatically tries to refresh using refreshToken.
 * Returns decoded { userId, email, role }.
 * Throws AppError("UNAUTHORIZED") if both tokens are missing or invalid.
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) return payload;
  }

  if (refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      await connectDB();
      const { default: User } = await import("@/models/User");
      const user = await User.findById(refreshPayload.userId);
      if (user) {
        return {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      }
    }
  }

  throw new AppError("UNAUTHORIZED", "Authentication required. Please log in.");
}
