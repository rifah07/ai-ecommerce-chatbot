import { z } from "zod";
import { PRODUCT_SIZES, PRODUCT_CATEGORIES } from "@/constants";

// Sub-schemas
const BrowseFiltersSchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  size: z.enum(PRODUCT_SIZES).optional(),
  tag: z.string().toLowerCase().optional(),
  search: z.string().optional(),
});

const CartTargetSchema = z.object({
  productName: z.string().optional(),
  size: z.enum(PRODUCT_SIZES).optional(),
  quantity: z.number().int().positive().optional().default(1),
});

const SizeRequestTargetSchema = z.object({
  productName: z.string().optional(),
  size: z.enum(PRODUCT_SIZES).optional(),
});

// Master schema (discriminated union)

export const IntentSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("BROWSE_PRODUCTS"),
    filters: BrowseFiltersSchema,
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("ADD_TO_CART"),
    target: CartTargetSchema,
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("REMOVE_FROM_CART"),
    target: CartTargetSchema,
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("VIEW_CART"),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("CHECKOUT"),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("REQUEST_SIZE"),
    target: SizeRequestTargetSchema,
    confidence: z.enum(["high", "medium", "low"]),
  }),
  z.object({
    intent: z.literal("UNKNOWN"),
    confidence: z.enum(["high", "medium", "low"]),
  }),
]);

export type ParsedIntent = z.infer<typeof IntentSchema>;
