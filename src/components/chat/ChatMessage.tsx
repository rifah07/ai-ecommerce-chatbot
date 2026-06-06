import { cn } from "@/lib/utils";
import type { IChatMessage } from "@/types";

interface ChatMessageProps {
    message: IChatMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
        >
            <div
                className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm",
                )}
            >
                {/* Render line breaks */}
                {message.content.split("\n").map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < message.content.split("\n").length - 1 && <br />}
                    </span>
                ))}
                <p
                    className={cn(
                        "text-[10px] mt-1 text-right",
                        isUser ? "text-gray-400" : "text-gray-400",
                    )}
                >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </div>
    );
}
