"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    ShoppingCart,
    Package,
    Search,
    Ruler,
    XCircle,
    Check,
} from "lucide-react";

export default function DemoPage() {
    const DEMO_SECTIONS = [
        {
            icon: Search,
            title: "Browse Products",
            color: "bg-blue-50 text-blue-600",
            messages: [
                "Show me all t-shirts",
                "Show me running products",
                "Show gym pants in size L",
                "Find casual t-shirts",
                "Show me pants tagged jogger",
                "Search for polo shirts",
                "Show T-Shirts in size M",
                "Show me streetwear",
            ],
        },
        {
            icon: ShoppingCart,
            title: "Manage Cart",
            color: "bg-green-50 text-green-600",
            messages: [
                "Add slim chino in M to my cart",
                "Add 2 classic white tees in L",
                "Remove the polo from my cart",
                "Change polo quantity to 2",
                "Set slim chino quantity to 3",
                "What is in my cart?",
                "View my cart",
            ],
        },
        {
            icon: Package,
            title: "Checkout & Orders",
            color: "bg-purple-50 text-purple-600",
            messages: [
                "Checkout",
                "Checkout only the slim chino",
                "Place order for the running tee",
                "Cancel my order",
                "Cancel my last order",
            ],
        },
        {
            icon: Ruler,
            title: "Size Requests",
            color: "bg-orange-50 text-orange-600",
            messages: [
                "I want the Nike running tee in XXL",
                "Do you have slim chino in XXL?",
                "Request XXL for the polo shirt",
            ],
        },
        {
            icon: XCircle,
            title: "What the bot cannot do",
            color: "bg-red-50 text-red-600",
            messages: [
                "What is the weather today?",
                "Tell me a joke",
                "Who won the football game?",
            ],
        },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto">
                    <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">ShopBot Chat Guide</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    ShopBot understands natural language. Click any message to copy it,
                    then paste it in the chat.
                </p>
                <Link href="/chat">
                    <Button size="lg" className="mt-2">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                    </Button>
                </Link>
            </div>

            {/* Demo sections */}
            {DEMO_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                    <div
                        key={section.title}
                        className="bg-white rounded-xl border p-6 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <h2 className="font-semibold text-gray-900">{section.title}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {section.messages.map((msg) => (
                                <DemoChip key={msg} message={msg} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Tips */}
            <div className="bg-gray-50 rounded-xl border p-6 space-y-3">
                <h2 className="font-semibold text-gray-900">💡 Tips</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                        • Combine filters:{" "}
                        <em>&quot;show running t-shirts in size L&quot;</em>
                    </li>
                    <li>
                        • Bot remembers context: say{" "}
                        <em>&quot;add the first one in M&quot;</em> after browsing
                    </li>
                    <li>
                        • If a size is unavailable, the bot records a request automatically
                    </li>
                    <li>
                        • Say <em>&quot;checkout only [product name]&quot;</em> to order a
                        single item
                    </li>
                    <li>• Only PENDING or CONFIRMED orders can be cancelled</li>
                </ul>
            </div>
        </div>
    );
}

// ── Client chip — needs onClick so must be in a "use client" file ─────────────
function DemoChip({ message }: { message: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <button
            onClick={handleCopy}
            title="Click to copy"
            className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200
                 text-gray-700 px-3 py-1.5 rounded-full transition-colors
                 border border-transparent hover:border-gray-300"
        >
            {copied ? (
                <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 text-xs">Copied!</span>
                </>
            ) : (
                <>&quot;{message}&quot;</>
            )}
        </button>
    );
}
