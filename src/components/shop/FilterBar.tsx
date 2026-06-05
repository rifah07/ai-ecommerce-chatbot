"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { PRODUCT_CATEGORIES, PRODUCT_SIZES } from "@/constants";

const POPULAR_TAGS = [
    "casual", "running", "gym", "sports", "outdoor",
    "streetwear", "formal", "summer", "slim-fit", "basics",
];

export default function FilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Read current filter values from URL
    const currentCategory = searchParams.get("category") ?? "";
    const currentSize = searchParams.get("size") ?? "";
    const currentTag = searchParams.get("tag") ?? "";
    const currentSearch = searchParams.get("search") ?? "";

    const hasActiveFilters = currentCategory || currentSize || currentTag || currentSearch;

    // Generic helper - updates a single param, keeps the rest
    const setParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const clearAll = () => router.push(pathname);

    // Toggle: clicking the active value clears it
    const toggleParam = (key: string, value: string) => {
        const current = searchParams.get(key);
        setParam(key, current === value ? "" : value);
    };

    return (
        <div className="bg-white border rounded-xl p-4 space-y-4">

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search products…"
                    defaultValue={currentSearch}
                    className="pl-9"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setParam("search", (e.target as HTMLInputElement).value.trim());
                        }
                    }}
                    onBlur={(e) => setParam("search", e.target.value.trim())}
                />
            </div>

            {/* Category */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Category
                </p>
                <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            variant={currentCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleParam("category", cat)}
                            className="h-7 text-xs"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Size */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Size
                </p>
                <div className="flex flex-wrap gap-2">
                    {PRODUCT_SIZES.map((size) => (
                        <Button
                            key={size}
                            variant={currentSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleParam("size", size)}
                            className="h-7 w-10 text-xs p-0"
                        >
                            {size}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Style
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TAGS.map((tag) => (
                        <Badge
                            key={tag}
                            variant={currentTag === tag ? "default" : "outline"}
                            className="cursor-pointer text-xs hover:bg-gray-100 transition-colors"
                            onClick={() => toggleParam("tag", tag)}
                        >
                            #{tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
                >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear all filters
                </Button>
            )}
        </div>
    );
}