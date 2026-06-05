"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, MessageCircle, Package, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const links = [
        { href: "/shop", label: "Shop", icon: Package },
        { href: "/chat", label: "Chat", icon: MessageCircle },
        { href: "/cart", label: "Cart", icon: ShoppingCart },
        { href: "/orders", label: "Orders", icon: Package },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/shop" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 hidden sm:block">
                            ShopBot
                        </span>
                    </Link>

                    {/* Nav links */}
                    <nav className="flex items-center gap-1">
                        {links.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:block">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span className="max-w-[120px] truncate">{user.name}</span>
                                    {user.role === "ADMIN" && (
                                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                                    )}
                                </div>
                                {user.role === "ADMIN" && (
                                    <Link href="/admin/dashboard">
                                        <Button variant="outline" size="sm">Dashboard</Button>
                                    </Link>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-gray-600 hover:text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:block ml-1">Logout</span>
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
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