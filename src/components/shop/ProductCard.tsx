"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import type { IProduct, ApiResponse } from "@/types";

interface ProductCardProps {
    product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasStock = product.stockQuantity > 0;

    async function handleAddToCart() {
        if (!selectedSize) {
            setError("Please select a size first.");
            return;
        }

        setAdding(true);
        setError(null);

        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: product._id,
                    size: selectedSize,
                    quantity: 1,
                }),
            });

            const data: ApiResponse<{
                added: boolean;
                sizeRequested?: boolean;
                message: string;
            }> = await res.json();

            if (!res.ok) {
                // 401 = not logged in
                if (res.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                setError("Failed to add to cart.");
                return;
            }

            if (data.success) {
                setAdded(true);
                setError(null);
                // Reset after 2 seconds
                setTimeout(() => {
                    setAdded(false);
                    setSelectedSize(null);
                }, 2000);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {!hasStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                        {product.category}
                    </Badge>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                    </p>
                </div>

                {/* Size picker */}
                <div className="flex flex-wrap gap-1">
                    {(["S", "M", "L", "XL", "XXL"] as const).map((size) => {
                        const available = product.availableSizes.includes(size);
                        const selected = selectedSize === size;
                        return (
                            <button
                                key={size}
                                disabled={!available}
                                onClick={() => {
                                    if (available) {
                                        setSelectedSize(selected ? null : size);
                                        setError(null);
                                    }
                                }}
                                className={`text-xs px-1.5 py-0.5 rounded border font-medium transition-colors
                  ${!available
                                        ? "border-gray-100 text-gray-300 bg-gray-50 line-through cursor-not-allowed"
                                        : selected
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-300 text-gray-700 bg-white hover:border-gray-500"
                                    }`}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>

                {/* Tags */}
                {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && <p className="text-xs text-red-500">{error}</p>}

                {/* Price + add to cart */}
                <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                    </span>
                    <Button
                        size="sm"
                        className="h-8"
                        disabled={!hasStock || adding}
                        onClick={handleAddToCart}
                    >
                        {added ? (
                            <>
                                <Check className="w-3.5 h-3.5 mr-1" /> Added
                            </>
                        ) : adding ? (
                            "Adding…"
                        ) : (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
