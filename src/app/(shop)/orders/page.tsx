"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { IOrder, ApiResponse } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const CANCELLABLE = ["PENDING", "CONFIRMED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/orders");
        const data: ApiResponse<IOrder[]> = await res.json();
        if (!cancelled && data.success) setOrders(data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    setCancelling(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH" });
      const data: ApiResponse<IOrder> = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: "CANCELLED" } : o,
          ),
        );
      }
    } finally {
      setCancelling(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-5 animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-200" />
        <div>
          <p className="text-gray-700 font-semibold text-lg">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Place your first order from the cart or chat.
          </p>
        </div>
        <Link href="/shop">
          <Button>Browse Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-xl border p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 font-mono">
                #{String(order._id).slice(-8).toUpperCase()}
              </span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? ""}`}
            >
              {order.status}
            </span>
          </div>

          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm text-gray-600"
              >
                <span>
                  {item.name} ({item.size}) x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-gray-900 border-t pt-2">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {CANCELLABLE.includes(order.status) && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                disabled={cancelling === order._id}
                onClick={() => cancelOrder(order._id)}
              >
                {cancelling === order._id ? "Cancelling…" : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
