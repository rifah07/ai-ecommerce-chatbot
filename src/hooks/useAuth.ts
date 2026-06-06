"use client";

import { useState, useEffect } from "react";
import type { IUser, ApiResponse } from "@/types";

interface UseAuthReturn {
  user: IUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let res = await fetch("/api/auth/me");

        // Access token expired — try refresh once
        if (res.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
          });
          if (refreshRes.ok) {
            res = await fetch("/api/auth/me");
          }
        }

        if (cancelled) return;

        const data: ApiResponse<{ user: IUser }> = await res.json();
        setUser(data.success ? data.data.user : null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []); // runs once on mount

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
