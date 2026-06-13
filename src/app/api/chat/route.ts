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

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const history = await chatService.getHistory(user.userId, page);
  return successResponse(history);
});

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
            "I couldn't find any products matching that. Try different filters.",
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
      if (!target.productName)
        return { reply: "Which product would you like to add?" };
      if (!target.size) return { reply: "What size? (S, M, L, XL, or XXL)" };
      const result = await cartService.addItemFromChat(userId, target);
      return { reply: result.message, data: result };
    }

    case "REMOVE_FROM_CART": {
      const target: CartTarget = intent.target ?? {};
      if (!target.productName)
        return { reply: "Which product would you like to remove?" };
      const result = await cartService.removeItemFromChat(userId, target);
      return { reply: result.message };
    }

    case "UPDATE_QUANTITY": {
      const target: CartTarget = intent.target ?? {};
      if (!target.productName)
        return { reply: "Which product quantity would you like to change?" };
      if (!target.quantity)
        return { reply: "What quantity would you like to set?" };
      const result = await cartService.updateQuantityFromChat(userId, target);
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
          return `• ${p?.name ?? "Product"} (${i.size}) x${i.quantity} — $${((p?.price ?? 0) * i.quantity).toFixed(2)}`;
        })
        .join("\n");
      return {
        reply: `Your cart (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""}, total $${cart.total.toFixed(2)}):\n${itemLines}`,
        data: cart,
      };
    }

    case "CHECKOUT": {
      const cart = await cartService.getCart(userId);
      if (cart.items.length === 0) {
        return { reply: "Your cart is empty — nothing to checkout!" };
      }
      const order = await orderService.checkout(userId);
      return {
        reply: `Order placed! 🎉 Order #${String(order._id).slice(-8).toUpperCase()}\nTotal: $${order.totalAmount.toFixed(2)}`,
        data: order,
      };
    }

    case "CHECKOUT_ITEM": {
      const target: CartTarget = intent.target ?? {};
      if (!target.productName) {
        return { reply: "Which product would you like to checkout?" };
      }
      try {
        const order = await orderService.checkoutItemByName(
          userId,
          target.productName,
          target.size,
        );
        return {
          reply: `Order placed for "${target.productName}"! 🎉 Order #${String(order._id).slice(-8).toUpperCase()}\nTotal: $${order.totalAmount.toFixed(2)}`,
          data: order,
        };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not checkout that item.";
        return { reply: msg };
      }
    }

    case "CANCEL_ORDER": {
      const orderId = "orderId" in intent ? intent.orderId : undefined;
      try {
        const order = await orderService.cancelOrder(userId, orderId);
        return {
          reply: `Order #${String(order._id).slice(-8).toUpperCase()} has been cancelled. Amount $${order.totalAmount.toFixed(2)} will be refunded.`,
          data: order,
        };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not cancel the order.";
        return { reply: msg };
      }
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
          'I\'m not sure what you mean. Try:\n• "show running t-shirts"\n• "add slim chino in M"\n• "change polo quantity to 2"\n• "checkout only the joggers"\n• "cancel my order"\n• "checkout"',
      };
  }
}

function buildBrowseLabel(filters: BrowseFilters): string {
  const parts: string[] = [];
  if (filters.category) parts.push(`in ${filters.category}`);
  if (filters.tag) parts.push(`tagged "${filters.tag}"`);
  if (filters.size) parts.push(`available in ${filters.size}`);
  if (filters.search) parts.push(`matching "${filters.search}"`);
  return parts.length > 0 ? parts.join(", ") : "in our catalog";
}
