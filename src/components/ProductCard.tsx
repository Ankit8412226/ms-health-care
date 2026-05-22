"use client";
import { useApp } from "@/context/AppContext";
import { Product } from "@/data/mockData";
import { Heart, ShoppingCart, Star, Eye, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist, setActivePage, setSelectedProductId } = useApp();
  const isWished = wishlist.includes(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleView = () => {
    setSelectedProductId(product.id);
    setActivePage("details");
  };

  return (
    <div className="group relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800/70 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-900/50">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3.5 left-3.5 z-10 bg-rose-500 dark:bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-md shadow-rose-500/10">
          -{discount}% OFF
        </div>
      )}

      {/* Prescription badge */}
      {product.prescriptionRequired && (
        <div className="absolute top-3.5 right-12 z-10 bg-teal-500 dark:bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-md shadow-teal-500/10">
          <ShieldCheck className="w-3 h-3" /> Rx
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3.5 right-3.5 z-10 w-8 h-8 bg-white/90 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
      >
        <Heart className={`w-3.5 h-3.5 transition-all ${isWished ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-400"}`} />
      </button>

      {/* Image */}
      <button onClick={handleView} className="relative w-full aspect-square bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden flex items-center justify-center p-4 border-b border-gray-50/80 dark:border-gray-900/40">
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-90"
          />
        </div>
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
          <div className="w-9 h-9 bg-white/95 dark:bg-gray-900/95 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-md border border-gray-150/40 dark:border-gray-850">
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        {product.bestSeller && (
          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 text-[8px] font-black tracking-widest px-2 py-0.5 rounded shadow-sm">
            BEST SELLER
          </div>
        )}
      </button>

      {/* Info */}
      <div className="p-4 flex flex-col items-start text-left">
        <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1.5">{product.manufacturer}</div>
        <button onClick={handleView} className="text-left block w-full">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug min-h-[38px]">
            {product.name}
          </h3>
        </button>
        <div className="text-[10px] text-gray-400 font-medium mt-1">{product.packSize}</div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/30">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{product.rating}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({product.reviewCount} reviews)</span>
        </div>

        {/* Price & Buy Action */}
        <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-gray-50 dark:border-gray-900/50">
          <div className="flex flex-col">
            {discount > 0 && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-0.5">₹{product.originalPrice}</span>
            )}
            <span className="text-base font-black text-gray-950 dark:text-white leading-none">₹{product.price}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
