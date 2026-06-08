"use client";

import { useState, useEffect } from "react";
import type {
  IChatMessage,
  ApiResponse,
  IChatHistory,
  IProduct,
  ICart,
  IOrder,
} from "@/types";

// Extended message type that can carry structured data
export interface ChatMessageWithData extends IChatMessage {
  data?: {
    type: "products" | "cart" | "order";
    payload: IProduct[] | ICart | IOrder;
  };
}

interface UseChatReturn {
  messages: ChatMessageWithData[];
  loading: boolean;
  sending: boolean;
  sendMessage: (text: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessageWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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
    const optimistic: ChatMessageWithData = {
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
      const result: ApiResponse<{
        message: string;
        messageId: string;
        data?: unknown;
      }> = await res.json();

      if (result.success) {
        // Detect what kind of data came back
        const raw = result.data.data;
        let attachedData: ChatMessageWithData["data"] = undefined;

        if (
          Array.isArray(raw) &&
          raw.length > 0 &&
          "availableSizes" in (raw[0] as object)
        ) {
          attachedData = { type: "products", payload: raw as IProduct[] };
        } else if (
          raw &&
          typeof raw === "object" &&
          "items" in (raw as object) &&
          "total" in (raw as object)
        ) {
          attachedData = { type: "cart", payload: raw as ICart };
        } else if (
          raw &&
          typeof raw === "object" &&
          "totalAmount" in (raw as object)
        ) {
          attachedData = { type: "order", payload: raw as IOrder };
        }

        const assistantMsg: ChatMessageWithData = {
          _id: result.data.messageId,
          userId: "",
          role: "assistant",
          content: result.data.message,
          timestamp: new Date(),
          data: attachedData,
        };

        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimistic._id),
          { ...optimistic, _id: `user-${Date.now()}` },
          assistantMsg,
        ]);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage };
}
