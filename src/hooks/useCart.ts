"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ICart, ApiResponse } from "@/types";

interface UseCartReturn {
  cart: ICart | null;
  loading: boolean;
  error: string | null;
  removeItem: (itemId: string) => Promise<void>;
  removing: string | null;
  checkout: () => Promise<void>;
  checkingOut: boolean;
  refetch: () => void;
}

export function useCart(): UseCartReturn {
  const router = useRouter();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [tick, setTick] = useState(0); // increment to trigger re-fetch

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cart");
        const data: ApiResponse<ICart> = await res.json();
        if (cancelled) return;
        if (data.success) {
          setCart(data.data);
        } else {
          setError(data.error.message);
        }
      } catch {
        if (!cancelled) setError("Failed to load cart");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tick]); // re-runs when tick changes

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setCart((prev) => {
          if (!prev) return prev;
          const removed = prev.items.find((i) => i._id === itemId);
          return {
            ...prev,
            items: prev.items.filter((i) => i._id !== itemId),
            itemCount: prev.itemCount - (removed?.quantity ?? 0),
          };
        });
      }
    } finally {
      setRemoving(null);
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/orders", { method: "POST" });
      const data: ApiResponse<{ _id: string }> = await res.json();
      if (data.success) {
        setCart(null);
        router.push("/orders");
      } else {
        setError(data.error.message);
      }
    } finally {
      setCheckingOut(false);
    }
  };

  return {
    cart,
    loading,
    error,
    removeItem,
    removing,
    checkout,
    checkingOut,
    refetch,
  };
}
