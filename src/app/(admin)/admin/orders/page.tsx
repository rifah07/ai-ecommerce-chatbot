"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApiResponse } from "@/types";

interface AdminOrder {
  _id: string;
  userId: { name: string; email: string };
  items: { name: string; size: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/orders");
        const data: ApiResponse<AdminOrder[]> = await res.json();
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

  const updateStatus = useCallback(async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: ApiResponse<AdminOrder> = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
        );
      }
    } finally {
      setUpdating(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-5 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        All Orders ({orders.length})
      </h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  #{String(order._id).slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 text-xs">
                    {order.userId?.name}
                  </p>
                  <p className="text-xs text-gray-400">{order.userId?.email}</p>
                </td>
                <td className="px-4 py-3">
                  {order.items.map((i, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      {i.name} ({i.size}) x{i.quantity}
                    </p>
                  ))}
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    disabled={updating === order._id}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer
                      ${STATUS_STYLES[order.status] ?? ""}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {updating === order._id && (
                    <span className="text-xs text-gray-400 ml-1">Saving…</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            No orders yet.
          </p>
        )}
      </div>
    </div>
  );
}
