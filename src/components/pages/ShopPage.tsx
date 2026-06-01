"use client";
import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import {
  SlidersHorizontal, Loader2, Pill, Activity, HeartPulse, Sparkles,
  ShieldAlert, Baby, Sun, Leaf, LayoutGrid, Folder
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Pill, Activity, HeartPulse, Sparkles, Baby, Sun, Leaf, ShieldAlert, LayoutGrid, Folder
};

export default function ShopPage() {
  const { products: allContextProducts, categories } = useApp();
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category") || "all";
  
  const [selectedCat, setSelectedCat] = useState(categoryQuery);
  const [sortBy, setSortBy] = useState("popular");
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Keep state in sync with URL category query updates
  useEffect(() => {
    setSelectedCat(categoryQuery);
  }, [categoryQuery]);
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const loadProducts = useCallback(async (pageNum: number, isNew: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/products?page=${pageNum}&limit=12&category=${selectedCat}&sort=${sortBy}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const mapped = json.data.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            shortDescription: p.shortDescription,
            price: p.price,
            regularPrice: p.regularPrice,
            onSale: p.onSale,
            rating: p.rating,
            reviewCount: p.reviewCount,
            category: p.category,
            categoryName: p.categoryName,
            brand: p.brand,
            images: p.images || [],
            image: p.image,
            salt: p.salt,
            dosage: p.dosage,
            manufacturer: p.manufacturer,
            prescriptionRequired: p.prescriptionRequired,
            packSize: p.packSize,
            storage: p.storage,
            howToUse: p.howToUse,
            sideEffects: p.sideEffects || [],
            benefits: p.benefits,
          }));

          if (isNew) {
            setProductsList(mapped);
          } else {
            setProductsList((prev) => [...prev, ...mapped]);
          }
          setTotalCount(json.total || mapped.length);
        }
      }
    } catch (err) {
      console.error("Fetch shop products error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCat, sortBy, API_URL]);

  // Load first page on filter/sort change
  useEffect(() => {
    setPage(1);
    loadProducts(1, true);
  }, [selectedCat, sortBy, loadProducts]);

  // Load more function
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage, false);
  };

  const sourceCategories = categories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">All Products</h1>
        <p className="text-gray-500 mt-1">{totalCount} products available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-60 flex-shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </h3>
             {sourceCategories.map((cat) => {
               const Icon = CATEGORY_ICONS[cat.icon] || LayoutGrid;
               return (
                 <button
                   key={cat.id}
                   onClick={() => setSelectedCat(cat.id)}
                   className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 border ${
                     selectedCat === cat.id
                       ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800 shadow-xs"
                       : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                   }`}
                 >
                   <span className="flex items-center gap-2">
                     <Icon className={`w-4 h-4 ${
                       selectedCat === cat.id ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                     }`} />
                     {cat.name}
                   </span>
                   {cat.id !== "all" && (
                     <span className="text-xs text-gray-450 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-md font-bold">
                       {(allContextProducts || []).filter((p) => p.category === cat.id).length}
                     </span>
                   )}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {/* Sort & Filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {/* Category Dropdown (Mobile/Tablet only) */}
              <div className="flex items-center gap-2 lg:hidden w-full sm:w-auto relative">
                <span className="text-sm text-gray-505 dark:text-gray-400 font-medium">Category:</span>
                <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setCatOpen(!catOpen)}
                    className="w-full sm:w-48 flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-850 dark:text-gray-200 cursor-pointer shadow-xs"
                  >
                    <span>{sourceCategories.find(c => c.id === selectedCat)?.name || "All Products"}</span>
                    <span className="text-[10px] text-gray-400">▼</span>
                  </button>
                  {catOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                      <div className="absolute left-0 mt-1.5 w-full sm:w-48 bg-white dark:bg-gray-850 border border-gray-200/80 dark:border-gray-750/80 rounded-xl shadow-lg z-25 max-h-60 overflow-y-auto overflow-x-hidden">
                        {sourceCategories.map((cat) => {
                          const count = cat.id !== "all"
                            ? (allContextProducts || []).filter((p) => p.category === cat.id).length
                            : null;
                          return (
                            <button
                              type="button"
                              key={cat.id}
                              onClick={() => {
                                setSelectedCat(cat.id);
                                setCatOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition-colors flex items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-800 last:border-b-0 ${
                                selectedCat === cat.id
                                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <span>{cat.name}</span>
                              {count !== null && (
                                <span className="text-[9px] text-gray-450 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/85 px-1.5 py-0.5 rounded font-bold">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto relative">
                <span className="text-sm text-gray-550 dark:text-gray-400 font-medium">Sort by:</span>
                <div className="relative w-full sm:w-auto flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="w-full sm:w-48 flex items-center justify-between gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-855 dark:text-gray-200 cursor-pointer shadow-xs"
                  >
                    <span>{
                      sortBy === "popular" ? "Most Popular" :
                      sortBy === "low" ? "Price: Low to High" :
                      sortBy === "high" ? "Price: High to Low" : "Highest Rated"
                    }</span>
                    <span className="text-[10px] text-gray-400">▼</span>
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-full sm:w-48 bg-white dark:bg-gray-850 border border-gray-200/80 dark:border-gray-750/80 rounded-xl shadow-lg z-25 overflow-hidden">
                        {[
                          { value: "popular", label: "Most Popular" },
                          { value: "low", label: "Price: Low to High" },
                          { value: "high", label: "Price: High to Low" },
                          { value: "rating", label: "Highest Rated" }
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-b-0 ${
                              sortBy === opt.value
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-gray-705 dark:text-gray-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-400 self-end sm:self-auto">{productsList.length} of {totalCount} shown</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {productsList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          )}

          {!loading && productsList.length < totalCount && (
            <div className="text-center mt-12 mb-6">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                View More
              </button>
            </div>
          )}

          {!loading && productsList.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
