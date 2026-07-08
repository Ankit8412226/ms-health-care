"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  Star, Heart, ShoppingCart, AlertCircle, ShieldCheck
} from "lucide-react";
import SafeImage from "@/components/SafeImage";

export default function DetailPage() {
  const { selectedProductId, addToCart, wishlist, toggleWishlist, setActivePage, products, getProductById, user } = useApp();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const currentProductId = idParam || selectedProductId || (products && products[0]?.id) || "";

  const [activeTab, setActiveTab] = useState<"desc" | "benefits" | "use" | "side">("desc");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState(true);

  // Product Reviews States
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isEligible, setIsEligible] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Review Form Input States
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const fetchReviews = useCallback(async () => {
    if (!currentProductId) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${currentProductId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReviewsList(json.data);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [currentProductId, API_URL]);

  const checkEligibility = useCallback(async () => {
    if (!currentProductId || !user || !user.token) {
      setIsEligible(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/reviews/${currentProductId}/eligible`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setIsEligible(!!(json.success && json.eligible));
      }
    } catch (err) {
      console.error("Error checking review eligibility:", err);
    }
  }, [currentProductId, user, API_URL]);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [currentProductId, fetchReviews, checkEligibility]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.token) return;
    if (!formComment.trim()) {
      setReviewError("Please write a comment for your review.");
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/reviews/${currentProductId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: formRating,
          comment: formComment
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setReviewSuccess(true);
        setFormComment("");
        setFormRating(5);
        setIsEligible(false);
        fetchReviews();
        
        if (product) {
          const updatedCount = product.reviewCount + 1;
          const updatedRating = Math.round((((product.rating * product.reviewCount) + formRating) / updatedCount) * 10) / 10;
          setProduct({
            ...product,
            rating: updatedRating,
            reviewCount: updatedCount
          });
        }
      } else {
        setReviewError(json.message || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!currentProductId) return;

    const preloaded = (products || []).find((p) => p.id === currentProductId);
    if (preloaded) {
      setProduct(preloaded);
      setSelectedImage(preloaded.image);
      setLoadingDetail(false);
    } else {
      setLoadingDetail(true);
    }

    getProductById(currentProductId).then((fetched) => {
      if (fetched) {
        setProduct(fetched);
        setSelectedImage(fetched.image);
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

  // Find similar products based on matching salt composition AND exact dosage/strength
  const getSimilarProducts = () => {
    if (product.salt) {
      const currentSalts = getCleanSalts(product.salt);
      const currentDosage = product.dosage ? product.dosage.toLowerCase().replace(/\s+/g, "") : "";
      
      return sourceProducts.filter((p) => {
        if (p.id === product.id) return false;
        if (!p.salt) return false;
        
        // 1. Check if they share at least one clean salt keyword
        const otherSalts = getCleanSalts(p.salt);
        const sharesSalt = currentSalts.some((s) => otherSalts.includes(s));
        if (!sharesSalt) return false;
        
        // 2. Check if dosage is same (if dosage exists on both)
        const otherDosage = p.dosage ? p.dosage.toLowerCase().replace(/\s+/g, "") : "";
        if (currentDosage && otherDosage && currentDosage !== otherDosage) {
          return false;
        }
        
        return true;
      }).slice(0, 4);
    }

    // Fallback: If no salt composition exists (e.g. devices/baby care), show other items in same category
    return sourceProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
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
            <SafeImage
              src={selectedImage || product.image}
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
                const imgSrc = img.src || product.image;
                const isSelected = (selectedImage || product.image) === imgSrc;
                return (
                  <div
                    key={`${img.id ?? ''}_${i}`}
                    onClick={() => setSelectedImage(imgSrc)}
                    className={`relative aspect-square rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/15"
                        : "border-emerald-500/20 hover:border-emerald-500/50"
                    }`}
                  >
                    <SafeImage
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

      {/* ===== REVIEWS SECTION ===== */}
      <div className="border-t border-gray-150 dark:border-gray-850 pt-12 pb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Patient Reviews &amp; Ratings</h2>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {loadingReviews ? (
              <p className="text-sm text-gray-400">Loading reviews...</p>
            ) : reviewsList.length === 0 ? (
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 font-medium">No reviews yet for this cancer medicine.</p>
                <p className="text-xs text-gray-400 mt-1">Be the first verified buyer to share your clinical review.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {reviewsList.map((rev) => (
                  <div key={rev._id} className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-850 dark:text-gray-200">{rev.userName}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full font-bold">Verified Buyer</span>
                      </div>
                      <span className="text-[10px] text-gray-405 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-emerald-500 text-emerald-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="lg:col-span-5 bg-gray-50 dark:bg-gray-900/45 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
            {isEligible ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Write a Review</h3>
                <p className="text-[10px] text-gray-400 leading-normal">
                  Thank you for your purchase! Your feedback helps other oncologists and patients choose authentic medications.
                </p>

                {reviewError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl">
                    {reviewError}
                  </div>
                )}

                {/* Rating star selectors */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block">Star Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-all text-gray-300 hover:text-emerald-500 cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= formRating ? "fill-emerald-500 text-emerald-500" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest block">Review Comments</label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe your therapy experience, shipment condition, efficacy, etc."
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Submit Review
                </button>
              </form>
            ) : reviewSuccess ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Review Submitted!</h4>
                <p className="text-xs text-gray-400">Bhai, thank you for your submission. Your review was posted successfully!</p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-550/5 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center space-y-2.5">
                <span className="text-lg">🔒</span>
                <h4 className="font-bold text-gray-850 dark:text-white text-xs">Review Locked</h4>
                <p className="text-[10px] text-gray-400 leading-normal max-w-xs mx-auto">
                  Only verified buyers who have purchased and received this product from Onco Life India can leave feedback reviews.
                </p>
              </div>
            )}
          </div>
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
