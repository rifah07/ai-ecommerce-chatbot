"use client";

import { useState, useEffect } from "react";
import type { IChatMessage, ApiResponse, IChatHistory } from "@/types";

interface UseChatReturn {
  messages: IChatMessage[];
  loading: boolean;
  sending: boolean;
  sendMessage: (text: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load history on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/chat");
        const data: ApiResponse<IChatHistory> = await res.json();
        if (!cancelled && data.success) {
          setMessages(data.data.messages);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = async (text: string) => {
    // Optimistic: add user message immediately
    const optimistic: IChatMessage = {
      _id: `temp-${Date.now()}`,
      userId: "",
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data: ApiResponse<{ message: string; messageId: string }> =
        await res.json();

      if (data.success) {
        // Replace optimistic message with confirmed one + add assistant reply
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimistic._id),
          { ...optimistic, _id: `user-${Date.now()}` },
          {
            _id: data.data.messageId,
            userId: "",
            role: "assistant",
            content: data.data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage };
}
