import { z } from "zod";
import { PRODUCT_SIZES } from "@/constants";

export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.enum(PRODUCT_SIZES, {
    message: "Size is required",
  }),
  quantity: z.number().int().positive().default(1),
});

export const UpdateCartSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;
