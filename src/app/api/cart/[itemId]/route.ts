import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { cartService } from "@/services/cartService";

/**
 * DELETE /api/cart/[itemId]
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    const user = await requireRole(request, "CUSTOMER");
    const { itemId } = await (
      context as { params: Promise<{ itemId: string }> }
    ).params;

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    const result = await cartService.removeItem(user.userId, itemId);
    return successResponse(result, result.message);
  },
);
