import { z } from "zod";
import { PRODUCT_SIZES, PRODUCT_CATEGORIES } from "@/constants";

export const ProductFiltersSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  size: z.enum(PRODUCT_SIZES).optional(),
  tag: z.string().toLowerCase().optional(),
  search: z.string().optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
