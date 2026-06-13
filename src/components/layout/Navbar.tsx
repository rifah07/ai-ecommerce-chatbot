"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import {
    ShoppingCart,
    MessageCircle,
    Package,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [, startTransition] = useTransition();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        startTransition(() => setOpen(false));
    }, [pathname]);

    const navLinks = [
        { href: "/shop", label: "Shop", icon: Package },
        { href: "/chat", label: "Chat", icon: MessageCircle },
        { href: "/cart", label: "Cart", icon: ShoppingCart },
        { href: "/orders", label: "Orders", icon: Package },
        { href: "/demo", label: "Demo", icon: HelpCircle },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/shop" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 hidden sm:block">
                            ShopBot
                        </span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:block">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                        ) : user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setOpen((o) => !o)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:block max-w-[100px] truncate">
                                        {user.name}
                                    </span>
                                    {user.role === "ADMIN" && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs hidden sm:block"
                                        >
                                            Admin
                                        </Badge>
                                    )}
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {open && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {user.email}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                {user.role.toLowerCase()}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/orders"
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Package className="w-4 h-4 text-gray-400" />
                                                My Orders
                                            </Link>
                                            <Link
                                                href="/cart"
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                                My Cart
                                            </Link>
                                            <Link
                                                href="/demo"
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <HelpCircle className="w-4 h-4 text-gray-400" />
                                                Chat Guide
                                            </Link>
                                            {user.role === "ADMIN" && (
                                                <>
                                                    <div className="border-t my-1" />
                                                    <Link
                                                        href="/admin/dashboard"
                                                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                                                        Admin Dashboard
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                        <div className="border-t py-1">
                                            <button
                                                onClick={logout}
                                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
