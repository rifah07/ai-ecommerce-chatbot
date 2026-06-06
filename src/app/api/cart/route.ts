import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { cartService } from "@/services/cartService";
import { AddToCartSchema } from "@/validators/cartValidators";

/**
 * GET /api/cart
 * Returns the authenticated customer's cart with populated product data.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const cart = await cartService.getCart(user.userId);
  return successResponse(cart);
});

/**
 * POST /api/cart
 * Body: { productId, size, quantity? }
 * Adds an item to cart. If size is unavailable, creates a SizeRequest instead.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const body = await request.json();
  const input = AddToCartSchema.parse(body);
  const result = await cartService.addItem(user.userId, input);
  return successResponse(result, result.message, 201);
});
