import { Suspense } from "react";
import FilterBar from "@/components/shop/FilterBar";
import ProductGrid from "@/components/shop/ProductGrid";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export const metadata = { title: "Shop — ShopBot" };

export default function ShopPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar filters - sticky on desktop */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Filters
          </h2>
          {/*
            FilterBar uses useSearchParams() which requires Suspense on the
            server.
          */}
          <Suspense fallback={<LoadingSpinner />}>
            <FilterBar />
          </Suspense>
        </div>
      </aside>

      {/* Product grid */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Products</h1>
        <Suspense fallback={<LoadingSpinner size="lg" className="py-20" />}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
