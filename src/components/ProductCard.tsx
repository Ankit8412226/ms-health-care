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
    <div className="group relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-800">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
          {discount}% OFF
        </div>
      )}

      {/* Prescription badge */}
      {product.prescriptionRequired && (
        <div className="absolute top-3 right-12 z-10 bg-blue-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Rx
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
      >
        <Heart className={`w-4 h-4 transition-colors ${isWished ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      {/* Image */}
      <button onClick={handleView} className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <div className="w-10 h-10 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 shadow-lg">
            <Eye className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        {product.bestSeller && (
          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
            ⭐ BEST SELLER
          </div>
        )}
      </button>

      {/* Info */}
      <div className="p-4">
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1 uppercase tracking-wider">{product.manufacturer}</div>
        <button onClick={handleView} className="text-left">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
            {product.name}
          </h3>
        </button>
        <div className="text-[11px] text-gray-400 mt-1">{product.packSize}</div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{product.rating}</span>
          </div>
          <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-lg font-black text-gray-900 dark:text-white">₹{product.price}</span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addToCart(product)}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
