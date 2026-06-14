"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessageWithData } from "@/hooks/useChat";
import type { IProduct, ICart, IOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, RefreshCw } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageWithData;
  onResend?: (text: string) => void;
}

export default function ChatMessage({ message, onResend }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex flex-col w-full gap-2",
        isUser ? "items-end" : "items-start",
      )}
    >
      {/* Text bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-gray-900 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm",
        )}
      >
        {message.content.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
        <p className="text-[10px] mt-1 text-right opacity-50">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Product cards (only available in current session, not after refresh) */}
      {message.data && (
        <div className="w-full">
          {message.data.type === "products" && (
            <ProductList products={message.data.payload as IProduct[]} />
          )}
          {message.data.type === "cart" && (
            <CartSummary cart={message.data.payload as ICart} />
          )}
          {message.data.type === "order" && (
            <OrderConfirmation order={message.data.payload as IOrder} />
          )}
        </div>
      )}

      {/* "Show again" button — appears after refresh when data is gone */}
      {!message.data && message.sourceQuery && onResend && (
        <button
          onClick={() => onResend(message.sourceQuery!)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600
                     bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full
                     border border-gray-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Show products again
        </button>
      )}
    </div>
  );
}

//  Product list with working horizontal scroll
function ProductList({ products }: { products: IProduct[] }) {
  if (products.length === 0) return null;

  return (
    <div
      className="overflow-x-auto pb-2"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-3" style={{ width: "max-content" }}>
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0 w-44 shadow-sm"
          >
            <div className="relative w-44 h-44 bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <div className="p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                {product.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {product.availableSizes.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {product.category}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//Cart summary

function CartSummary({ cart }: { cart: ICart }) {
  if (cart.items.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 max-w-xs shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-gray-500" />
        <p className="text-xs font-semibold text-gray-700">Your Cart</p>
      </div>
      <div className="space-y-1">
        {cart.items.slice(0, 4).map((item) => {
          const p = item.product as unknown as { name?: string } | undefined;
          return (
            <div
              key={item._id}
              className="flex justify-between text-xs text-gray-600"
            >
              <span className="truncate max-w-[140px]">
                {p?.name ?? "Product"} ({item.size})
              </span>
              <span className="font-medium shrink-0 ml-2">
                x{item.quantity}
              </span>
            </div>
          );
        })}
        {cart.items.length > 4 && (
          <p className="text-xs text-gray-400">+{cart.items.length - 4} more</p>
        )}
      </div>
      <div className="border-t pt-2 flex justify-between text-xs font-bold text-gray-900">
        <span>Total</span>
        <span>${cart.total.toFixed(2)}</span>
      </div>
    </div>
  );
}

// Order confirmation
function OrderConfirmation({ order }: { order: IOrder }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1 max-w-xs shadow-sm">
      <p className="text-xs font-bold text-green-800">Order Confirmed!</p>
      <p className="text-xs text-green-700">
        ID: #{String(order._id).slice(-8).toUpperCase()}
      </p>
      <p className="text-xs font-bold text-green-800">
        Total: ${order.totalAmount.toFixed(2)}
      </p>
      <p className="text-xs text-green-600 capitalize">
        Status: {order.status.toLowerCase()}
      </p>
    </div>
  );
}
