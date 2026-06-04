import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { productService } from "@/services/productService";
import { ProductFiltersSchema } from "@/validators/productValidators";

/**
 * GET /api/products
 *
 * Query params (all optional):
 *   ?category=T-Shirt
 *   ?size=L
 *   ?tag=running
 *   ?search=nike
 *
 * Combinations work: ?category=T-Shirt&tag=gym
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Parse and validate query params with Zod
  // Unknown params are stripped; invalid values return 422
  const filters = ProductFiltersSchema.parse({
    category: searchParams.get("category") ?? undefined,
    size: searchParams.get("size") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  const products = await productService.getProducts(filters);

  return successResponse(products);
});
