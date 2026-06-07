import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { orderService } from "@/services/orderService";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const orders = await orderService.getUserOrders(user.userId);
  return successResponse(orders);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const order = await orderService.checkout(user.userId);
  return successResponse(order, "Order placed successfully", 201);
});
