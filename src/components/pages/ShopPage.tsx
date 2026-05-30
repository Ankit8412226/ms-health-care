"use client";
import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { SlidersHorizontal, Loader2 } from "lucide-react";

export default function ShopPage() {
  const { products: allContextProducts, categories } = useApp();
  const [selectedCat, setSelectedCat] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  
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
        {/* Category sidebar */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </h3>
            {sourceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCat === cat.id
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {cat.name}
                {cat.id !== "all" && (
                  <span className="float-right text-xs text-gray-400">
                    {(allContextProducts || []).filter((p) => p.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="popular">Most Popular</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <span className="text-sm text-gray-400">{productsList.length} of {totalCount} shown</span>
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
