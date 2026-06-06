"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartItemProps {
    item: {
        _id: string;
        size: string;
        quantity: number;
        product: {
            _id: string;
            name: string;
            image: string;
            price: number;
            category: string;
        };
    };
    onRemove: (itemId: string) => void;
    removing: boolean;
}

export default function CartItem({ item, onRemove, removing }: CartItemProps) {
    const subtotal = item.product.price * item.quantity;

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border">

            {/* Product image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{item.product.category}</Badge>
                    <Badge variant="secondary" className="text-xs">{item.size}</Badge>
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 mt-1">
                    ${subtotal.toFixed(2)}
                    {item.quantity > 1 && (
                        <span className="text-xs font-normal text-gray-400 ml-1">
                            (${item.product.price.toFixed(2)} each)
                        </span>
                    )}
                </p>
            </div>

            {/* Remove button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item._id)}
                disabled={removing}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

        </div>
    );
}