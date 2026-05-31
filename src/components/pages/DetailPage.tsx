"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  Star, Heart, ShoppingCart, AlertCircle, ShieldCheck
} from "lucide-react";
import Image from "next/image";

export default function DetailPage() {
  const { selectedProductId, addToCart, wishlist, toggleWishlist, setActivePage, products, getProductById } = useApp();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const currentProductId = idParam || selectedProductId || (products && products[0]?.id) || "";

  const [activeTab, setActiveTab] = useState<"desc" | "benefits" | "use" | "side">("desc");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    if (!currentProductId) return;

    const preloaded = (products || []).find((p) => p.id === currentProductId);
    if (preloaded) {
      setProduct(preloaded);
      setLoadingDetail(false);
    } else {
      setLoadingDetail(true);
    }

    getProductById(currentProductId).then((fetched) => {
      if (fetched) {
        setProduct(fetched);
      }
      setLoadingDetail(false);
    });
  }, [currentProductId, products, getProductById]);

  const sourceProducts = products || [];

  if (loadingDetail && !product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-400 font-semibold">Product not found.</p>
        <button
          onClick={() => setActivePage("shop")}
          className="mt-4 px-6 py-2.5 bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const discount = (product.regularPrice > product.price && product.regularPrice > 0)
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0;

  // Find similar products based on matching salt composition first, then fallback/pad with category
  const getSimilarProducts = () => {
    let matches: Product[] = [];
    if (product.salt) {
      const currentSalts = product.salt.toLowerCase().split(/[\s,()\-+]+/).filter((w: string) => w.length > 3);
      matches = sourceProducts.filter((p) => {
        if (p.id === product.id) return false;
        if (!p.salt) return false;
        const otherSalts = p.salt.toLowerCase();
        return currentSalts.some((salt: string) => otherSalts.includes(salt));
      });
    }

    if (matches.length < 4) {
      const categoryMatches = sourceProducts.filter(
        (p) => p.category === product.category && p.id !== product.id && !matches.some(m => m.id === p.id)
      );
      matches = [...matches, ...categoryMatches];
    }

    if (matches.length < 4) {
      const otherProducts = sourceProducts.filter(
        (p) => p.id !== product.id && !matches.some(m => m.id === p.id)
      );
      matches = [...matches, ...otherProducts];
    }
    return matches.slice(0, 4);
  };

  const similar = getSimilarProducts();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <button onClick={() => setActivePage("home")} className="hover:text-emerald-600">Home</button>
        <span>/</span>
        <button onClick={() => setActivePage("shop")} className="hover:text-emerald-600">Shop</button>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        {/* Images Column */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-150 dark:border-gray-800 cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-100"
              style={{
                transform: isZoomed ? "scale(2)" : "scale(1)",
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              }}
            />
            {product.prescriptionRequired && (
              <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" /> Prescription Required (Rx)
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {discount}% OFF
              </span>
            )}
          </div>
          {/* Image gallery - uses product.images array from API */}
          <div className="grid grid-cols-4 gap-2">
            {(() => {
              const list = (product.images && product.images.length > 0)
                ? product.images
                : [{ id: 0, src: product.image, thumbnail: product.image, alt: product.name }];
              
              const paddedList = [...list];
              while (paddedList.length < 4 && paddedList[0]) {
                paddedList.push(paddedList[0]);
              }

              return paddedList.slice(0, 4).map((img, i) => {
                if (!img) return null;
                return (
                  <div key={`${img.id ?? ''}_${i}`} className="relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden border-2 border-emerald-500/20 cursor-pointer">
                    <Image
                      src={img.thumbnail || img.src || product.image}
                      alt={img.alt || product.name}
                      fill
                      sizes="100px"
                      className="object-cover hover:opacity-80"
                    />
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{product.brand || product.manufacturer}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">{product.name}</h1>
            {product.salt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">Composition: {product.salt}{product.dosage ? ` • ${product.dosage}` : ""}</p>
            )}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3.5 italic leading-relaxed border-l-2 border-emerald-500/30 pl-3">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 py-2 border-y border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{product.rating}</span>
            </div>
            <span className="text-xs text-gray-500">{product.reviewCount} Verified Ratings &amp; Reviews</span>
          </div>

          {/* Price details */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.regularPrice}</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Save ₹{product.regularPrice - product.price} ({discount}% off)</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">Inclusive of all taxes</p>
          </div>

          {/* Action Area */}
          <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold text-gray-800 dark:text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>

            <button
              onClick={() => { addToCart(product, quantity); setActivePage("cart"); }}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWished ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>

          {/* Quick Specifications list */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400">Pack Size:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{product.packSize}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400">Dosage:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{product.dosage || "As prescribed"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400">Manufacturer:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{product.manufacturer}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400">Storage:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{product.storage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Medical Details */}
      <div className="mb-12 border-t border-gray-150 dark:border-gray-850 pt-8">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-4 scrollbar-none">
          {([
              { id: "desc",     label: "Description" },
              { id: "benefits", label: "Benefits" },
              { id: "use",      label: "How to Use" },
              { id: "side",     label: "Side Effects" },
            ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl space-y-4">
          {activeTab === "desc" && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-3 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs">
                  <strong>Safety Advice:</strong> Clinical medicines should only be consumed as advised by registered healthcare practitioners. Never exceed standard doses.
                </p>
              </div>
            </div>
          )}
          {activeTab === "benefits" && (
            <p>{product.benefits}</p>
          )}
          {activeTab === "use" && (
            <p>{product.howToUse}</p>
          )}
          {activeTab === "side" && (
            <ul className="list-disc pl-5 space-y-2 text-red-600 dark:text-red-400">
              {product.sideEffects.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <div className="border-t border-gray-150 dark:border-gray-850 pt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similar.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
