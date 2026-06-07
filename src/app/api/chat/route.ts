import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { chatService } from "@/services/chatService";
import { cartService } from "@/services/cartService";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { sizeRequestService } from "@/services/sizeRequestService";
import { extractIntent } from "@/lib/gemini/client";
import { SendMessageSchema } from "@/validators/chatValidators";
import type { ParsedIntent } from "@/validators/intentValidators";
import type { CartTarget, SizeRequestTarget, BrowseFilters } from "@/types";

// GET /api/chat

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const history = await chatService.getHistory(user.userId, page);
  return successResponse(history);
});

// POST /api/chat

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const body = await request.json();
  const { message } = SendMessageSchema.parse(body);

  await chatService.saveMessage(user.userId, "user", message);

  const recent = await chatService.getRecentMessages(user.userId, 6);
  const intent = await extractIntent(
    message,
    recent.map((m) => ({ role: m.role, content: m.content })),
  );

  const { reply, data } = await routeIntent(intent, user.userId);

  const saved = await chatService.saveMessage(user.userId, "assistant", reply);

  return successResponse({ message: reply, data, messageId: saved._id });
});

// Intent router

async function routeIntent(
  intent: ParsedIntent,
  userId: string,
): Promise<{ reply: string; data?: unknown }> {
  switch (intent.intent) {
    case "BROWSE_PRODUCTS": {
      const filters: BrowseFilters = intent.filters ?? {};
      const products = await productService.getProducts(filters);

      if (products.length === 0) {
        return {
          reply:
            "I couldn't find any products matching that. Try different filters or browse the shop.",
          data: [],
        };
      }

      const label = buildBrowseLabel(filters);
      return {
        reply: `Here are ${products.length} product${products.length !== 1 ? "s" : ""} ${label}:`,
        data: products,
      };
    }

    case "ADD_TO_CART": {
      const target: CartTarget = intent.target ?? {};

      if (!target.productName) {
        return {
          reply:
            "Which product would you like to add? Please give me the name.",
        };
      }
      if (!target.size) {
        return { reply: "What size would you like? (S, M, L, XL, or XXL)" };
      }

      const result = await cartService.addItemFromChat(userId, target);
      return { reply: result.message, data: result };
    }

    case "REMOVE_FROM_CART": {
      const target: CartTarget = intent.target ?? {};

      if (!target.productName) {
        return {
          reply: "Which product would you like to remove from your cart?",
        };
      }

      const result = await cartService.removeItemFromChat(userId, target);
      return { reply: result.message };
    }

    case "VIEW_CART": {
      const cart = await cartService.getCart(userId);

      if (cart.items.length === 0) {
        return {
          reply: "Your cart is empty. Want me to help you find something?",
          data: cart,
        };
      }

      const itemLines = cart.items
        .map((i) => {
          const p = i.product as unknown as
            | { name?: string; price?: number }
            | undefined;
          const name = p?.name ?? "Product";
          const price = p?.price ?? 0;
          return `• ${name} (${i.size}) x${i.quantity} — $${(price * i.quantity).toFixed(2)}`;
        })
        .join("\n");

      return {
        reply: `Here's your cart (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""}, total $${cart.total.toFixed(2)}):\n${itemLines}`,
        data: cart,
      };
    }

    case "CHECKOUT": {
      const cart = await cartService.getCart(userId);

      if (cart.items.length === 0) {
        return {
          reply:
            "Your cart is empty — nothing to checkout. Add some items first!",
        };
      }

      const order = await orderService.checkout(userId);
      return {
        reply: `Order placed! Order ID: #${String(order._id).slice(-8).toUpperCase()}\nTotal: $${order.totalAmount.toFixed(2)}\nWe'll process it shortly.`,
        data: order,
      };
    }

    case "REQUEST_SIZE": {
      const target: SizeRequestTarget = intent.target ?? {};
      const result = await sizeRequestService.createFromChat(userId, target);
      return { reply: result.message };
    }

    case "UNKNOWN":
    default:
      return {
        reply:
          'I\'m not sure what you mean. You can ask me to:\n• Show products (e.g. "show running t-shirts")\n• Add to cart (e.g. "add slim chino in L")\n• View or manage your cart\n• Checkout',
      };
  }
}

// Helper

function buildBrowseLabel(filters: BrowseFilters): string {
  const parts: string[] = [];
  if (filters.category) parts.push(`in ${filters.category}`);
  if (filters.tag) parts.push(`tagged "${filters.tag}"`);
  if (filters.size) parts.push(`available in ${filters.size}`);
  if (filters.search) parts.push(`matching "${filters.search}"`);
  return parts.length > 0 ? parts.join(", ") : "in our catalog";
}
