import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { cartService } from "@/services/cartService";
import { z } from "zod";

const UpdateQtySchema = z.object({
  quantity: z.number().int().min(0),
});

export const DELETE = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    const user = await requireRole(request, "CUSTOMER");
    const { itemId } = await (
      context as { params: Promise<{ itemId: string }> }
    ).params;
    const result = await cartService.removeItem(user.userId, itemId);
    return successResponse(result, result.message);
  },
);

export const PATCH = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    const user = await requireRole(request, "CUSTOMER");
    const { itemId } = await (
      context as { params: Promise<{ itemId: string }> }
    ).params;
    const body = await request.json();
    const { quantity } = UpdateQtySchema.parse(body);
    const result = await cartService.updateQuantity(
      user.userId,
      itemId,
      quantity,
    );
    return successResponse(result);
  },
);
