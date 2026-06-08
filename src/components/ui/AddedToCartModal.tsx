"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import { Check, ShoppingBag, ArrowRight, X, Sparkles, Star, Plus } from "lucide-react";
import Image from "next/image";

export default function AddedToCartModal() {
  const { addedProduct, setAddedProduct, addToCart, cart, setActivePage, products } = useApp();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!addedProduct) return null;

  // Helper to extract clean chemical salt keywords
  const getCleanSalts = (saltStr: string) => {
    if (!saltStr) return [];
    const ignoredWords = new Set([
      "ip", "usp", "bp", "tablet", "tablets", "capsule", "capsules", 
      "mg", "mcg", "g", "ml", "sr", "er", "dr", "with", "and", "or", 
      "of", "in", "for", "to", "at", "by", "from", "on", "an", "the", "a",
      "technology", "optizorb", "hydrochloride", "sodium", "calcium",
      "potassium", "chloride", "sulfate", "phosphate", "maleate",
      "acetate", "mesylate", "tartrate", "citrate", "fumarate", 
      "succinate", "hydrate"
    ]);
    return saltStr
      .toLowerCase()
      .split(/[\s,()\-+./]+/)
      .map(w => w.replace(/[\d\W_]+/g, "").trim())
      .filter(w => w.length > 2 && !ignoredWords.has(w));
  };

  // Find similar products in the same category, pad with other products if needed
  const sourceProducts = products || [];
  let similarProducts: Product[] = [];
  
  if (addedProduct.salt) {
    const currentSalts = getCleanSalts(addedProduct.salt);
    const currentDosage = addedProduct.dosage ? addedProduct.dosage.toLowerCase().replace(/\s+/g, "") : "";
    
    similarProducts = sourceProducts.filter((p) => {
      if (p.id === addedProduct.id) return false;
      if (!p.salt) return false;
      
      const otherSalts = getCleanSalts(p.salt);
      const sharesSalt = currentSalts.some((s) => otherSalts.includes(s));
      if (!sharesSalt) return false;
      
      const otherDosage = p.dosage ? p.dosage.toLowerCase().replace(/\s+/g, "") : "";
      if (currentDosage && otherDosage && currentDosage !== otherDosage) {
        return false;
      }
      
      return true;
    });
  } else {
    // If no salt exists, fallback to category matching
    similarProducts = sourceProducts.filter(
      (p) => p.category === addedProduct.category && p.id !== addedProduct.id
    );
  }
  
  similarProducts = similarProducts.slice(0, 3);

  // Cart statistics
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleAddSimilar = (product: Product) => {
    addToCart(product, 1, false); // Add to cart but don't re-trigger modal
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const handleClose = () => {
    setAddedProduct(null);
  };

  const handleNavigate = (page: "cart" | "checkout") => {
    setActivePage(page);
    setAddedProduct(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/35 z-10 animate-scale-in max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Added to Cart Successfully!</h3>
            <p className="text-xs text-gray-400">Your health shopping cart has been updated.</p>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-none">
          {/* Main Added Product Card & Summary Grid */}
          <div className="grid md:grid-cols-2 gap-6 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-cyan-50/30 dark:from-gray-850 dark:via-gray-850 dark:to-gray-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/10">
            {/* Left Column: Added Product details */}
            <div className="flex gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-700 flex-shrink-0">
                <Image src={addedProduct.image} alt={addedProduct.name} fill className="object-cover" />
              </div>
              <div className="space-y-1 select-none min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block truncate">
                  {addedProduct.brand || addedProduct.manufacturer}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight">
                  {addedProduct.name}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 font-mono block">
                  Pack: {addedProduct.packSize}
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-gray-900 dark:text-white">₹{addedProduct.price}</span>
                  {addedProduct.regularPrice > addedProduct.price && (
                    <span className="text-xs text-gray-400 line-through">₹{addedProduct.regularPrice}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Cart summary and checkout */}
            <div className="flex flex-col justify-between md:border-l border-gray-200/50 dark:border-gray-850 md:pl-6 space-y-4 md:space-y-0">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Cart Subtotal ({cartItemCount} items)</span>
                <span className="font-black text-gray-900 dark:text-white text-base">₹{cartSubtotal}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleNavigate("cart")}
                  className="w-full py-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> View Cart
                </button>
                <button
                  onClick={() => handleNavigate("checkout")}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Similar Products Recommendation */}
          {similarProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider">Frequently Bought Together</span>
              </div>

              {/* Horizontal Scroll on Mobile, Grid on Desktop */}
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
                {similarProducts.map((p) => {
                  const isAdded = addedIds.includes(p.id);
                  const discount = (p.regularPrice > p.price && p.regularPrice > 0)
                    ? Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={p.id}
                      className="w-[170px] sm:w-auto flex-shrink-0 bg-gray-50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-3 flex flex-col justify-between gap-3 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all group"
                    >
                      <div className="space-y-2">
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-150 dark:border-gray-700">
                          <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          {discount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Title & Rating */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase truncate">
                            {p.brand || p.manufacturer}
                          </span>
                          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[9px] text-gray-400">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-gray-600 dark:text-gray-300">{p.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-850/50">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-gray-900 dark:text-white">₹{p.price}</span>
                          {p.regularPrice > p.price && (
                            <span className="text-[9px] text-gray-400 line-through truncate">₹{p.regularPrice}</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddSimilar(p)}
                          disabled={isAdded}
                          className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            isAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-600 hover:text-white shadow-sm"
                          }`}
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold pr-1">Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Continue Shopping link */}
          <div className="text-center pt-2">
            <button
              onClick={handleClose}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
