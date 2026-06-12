import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { orderService } from "@/services/orderService";

/**
 * PATCH /api/orders/[id]
 * Customer cancels their own order.
 */
export const PATCH = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    const user = await requireRole(request, "CUSTOMER");
    const { id } = await (context as { params: Promise<{ id: string }> })
      .params;
    const order = await orderService.cancelOrder(user.userId, id);
    return successResponse(order, "Order cancelled successfully");
  },
);
