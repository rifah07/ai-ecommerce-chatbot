"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CartItemCard from "@/components/cart/CartItem";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useCart } from "@/hooks/useCart";
import type { ApiResponse, IOrder } from "@/types";

export default function CartView() {
  const router = useRouter();
  const { cart, loading, error, removeItem, removing, checkout, checkingOut } =
    useCart();
  const [orderingItem, setOrderingItem] = useState<string | null>(null);

  const orderSingleItem = useCallback(
    async (itemId: string) => {
      setOrderingItem(itemId);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
        const data: ApiResponse<IOrder> = await res.json();
        if (data.success) {
          router.push("/orders");
        }
      } finally {
        setOrderingItem(null);
      }
    },
    [router],
  );

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-200" />
        <div>
          <p className="text-gray-700 font-semibold text-lg">
            Your cart is empty
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Use the chatbot or browse the shop to add items.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/shop">
            <Button variant="outline">Browse Shop</Button>
          </Link>
          <Link href="/chat">
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Your Cart
        <span className="text-base font-normal text-gray-400 ml-2">
          ({cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""})
        </span>
      </h1>

      {/* Cart items */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div key={item._id} className="space-y-2">
            <CartItemCard
              item={item as Parameters<typeof CartItemCard>[0]["item"]}
              onRemove={removeItem}
              removing={removing === item._id}
            />
            {/* Order single item button */}
            <div className="flex justify-end pr-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                disabled={orderingItem === item._id || checkingOut}
                onClick={() => orderSingleItem(item._id)}
              >
                {orderingItem === item._id
                  ? "Placing…"
                  : "Order this item only"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Order Summary</h2>
        <Separator />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({cart.itemCount} items)</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>

        <Button
          className="w-full mt-2"
          size="lg"
          onClick={checkout}
          disabled={checkingOut || !!orderingItem}
        >
          {checkingOut
            ? "Placing order…"
            : `Checkout All - $${cart.total.toFixed(2)}`}
        </Button>

        <p className="text-center text-xs text-gray-400">
          Or tell the chatbot{" "}
          <Link href="/chat" className="underline hover:text-gray-600">
            &quot;checkout&quot;
          </Link>{" "}
          to order from there.
        </p>
      </div>
    </div>
  );
}
