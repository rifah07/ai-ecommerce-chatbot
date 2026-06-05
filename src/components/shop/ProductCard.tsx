import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle } from "lucide-react";
import type { IProduct } from "@/types";

interface ProductCardProps {
    product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
    const hasStock = product.stockQuantity > 0;

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

                {/* Available sizes */}
                <div className="flex flex-wrap gap-1">
                    {(["S", "M", "L", "XL", "XXL"] as const).map((size) => {
                        const available = product.availableSizes.includes(size);
                        return (
                            <span
                                key={size}
                                className={`text-xs px-1.5 py-0.5 rounded border font-medium
                  ${available
                                        ? "border-gray-300 text-gray-700 bg-white"
                                        : "border-gray-100 text-gray-300 bg-gray-50 line-through"
                                    }`}
                            >
                                {size}
                            </span>
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

                {/* Price + actions */}
                <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <a href="/chat" title="Ask the chatbot about this product">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MessageCircle className="w-3.5 h-3.5" />
                            </Button>
                        </a>
                        <a href="/cart" title="Go to cart">
                            <Button size="sm" className="h-8" disabled={!hasStock}>
                                <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                                Add
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
