"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";

export default function ShopPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  let filtered = selectedCat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === selectedCat);

  if (sortBy === "low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">All Products</h1>
        <p className="text-gray-500 mt-1">{filtered.length} products available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category sidebar */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </h3>
            {CATEGORIES.map((cat) => (
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
                    {PRODUCTS.filter((p) => p.category === cat.id).length}
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
            <span className="text-sm text-gray-400">{filtered.length} results</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
