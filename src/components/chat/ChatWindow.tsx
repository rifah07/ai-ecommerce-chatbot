"use client";

import { useRef, useEffect } from "react";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";

export default function ChatWindow() {
  const { messages, loading, sending, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50 shrink-0 rounded-t-xl">
        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">
            ShopBot Assistant
          </p>
          <p className="text-xs text-gray-400">
            Ask me to show products, add to cart, or checkout
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <LoadingSpinner size="md" className="py-10" />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
            <MessageCircle className="w-10 h-10 text-gray-200" />
            <div>
              <p className="text-gray-500 font-medium text-sm">
                Start a conversation
              </p>
              <p className="text-gray-400 text-xs mt-1 max-w-xs">
                Try asking me to show products or add something to your cart.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {[
                "Show me all t-shirts",
                "Show running products",
                "View my cart",
                "Show gym pants in size L",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg._id} message={msg} onResend={sendMessage} />
          ))
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 rounded-b-xl border-t">
        <ChatInput onSend={sendMessage} disabled={sending} />
      </div>
    </div>
  );
}
