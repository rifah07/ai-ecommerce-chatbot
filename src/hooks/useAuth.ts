"use client";

import { useState, useEffect, useCallback } from "react";
import type { IUser, ApiResponse } from "@/types";

interface AuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch("/api/auth/me");

      // access token expired → try refresh
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (refreshRes.ok) {
          const retryRes = await fetch("/api/auth/me");
          const retryData: ApiResponse<{ user: IUser }> = await retryRes.json();

          if (retryData.success) {
            setState({
              user: retryData.data.user,
              loading: false,
              error: null,
            });
            return;
          }
        }

        setState({ user: null, loading: false, error: null });
        return;
      }

      const data: ApiResponse<{ user: IUser }> = await res.json();

      if (data.success) {
        setState({
          user: data.data.user,
          loading: false,
          error: null,
        });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    } catch {
      setState({
        user: null,
        loading: false,
        error: "Failed to fetch user",
      });
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");

        if (res.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
          });

          if (refreshRes.ok) {
            const retryRes = await fetch("/api/auth/me");
            const retryData = await retryRes.json();

            if (retryData.success) {
              setState({
                user: retryData.data.user,
                loading: false,
                error: null,
              });
              return;
            }
          }

          setState({ user: null, loading: false, error: null });
          return;
        }

        const data = await res.json();

        if (data.success) {
          setState({
            user: data.data.user,
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, loading: false, error: null });
        }
      } catch {
        setState({
          user: null,
          loading: false,
          error: "Failed to fetch user",
        });
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, loading: false, error: null });
    window.location.href = "/login";
  };

  return { ...state, logout, refetch: fetchUser };
}
