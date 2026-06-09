import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { orderService } from "@/services/orderService";
import { z } from "zod";

const CheckoutSchema = z.object({
  // If itemId provided → checkout only that item
  // If omitted → checkout entire cart
  itemId: z.string().optional(),
});

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const orders = await orderService.getUserOrders(user.userId);
  return successResponse(orders);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");

  let itemId: string | undefined;
  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (parsed.success) itemId = parsed.data.itemId;
  } catch {
    // No body sent = checkout all cart
  }

  const order = itemId
    ? await orderService.checkoutItem(user.userId, itemId)
    : await orderService.checkout(user.userId);

  return successResponse(order, "Order placed successfully", 201);
});
