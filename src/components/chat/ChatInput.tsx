"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [text, setText] = useState("");
    const ref = useRef<HTMLTextAreaElement>(null);

    function submit() {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText("");
        ref.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        // Send on Enter, new line on Shift+Enter
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    return (
        <div className="flex items-end gap-2 p-4 border-t bg-white">
            <Textarea
                ref={ref}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to show products, add to cart, checkout…"
                disabled={disabled}
                rows={1}
                className="resize-none min-h-[44px] max-h-[120px] flex-1"
            />
            <Button
                onClick={submit}
                disabled={disabled || !text.trim()}
                size="icon"
                className="h-11 w-11 shrink-0"
            >
                <Send className="w-4 h-4" />
            </Button>
        </div>
    );
}
