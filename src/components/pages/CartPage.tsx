"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Trash2, ShoppingBag, ShieldCheck, Ticket, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    couponCode,
    discountPercentage,
    applyCoupon,
    removeCoupon,
    setActivePage
  } = useApp();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const requiresRx = cart.some((item) => item.product.prescriptionRequired);
  const deliveryCharges = subtotal - discountAmount > 500 || subtotal === 0 ? 0 : 49;
  const total = subtotal - discountAmount + deliveryCharges;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (!success) {
      setCouponError("Invalid coupon code. Try 'HEALTH5' or 'MSCARE20'.");
    } else {
      setCouponInput("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
        <ShoppingBag className="w-8 h-8 text-emerald-600" /> Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Looks like you haven&apos;t added any medicines or health products yet.</p>
          <button
            onClick={() => setActivePage("shop")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {requiresRx && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 rounded-2xl flex gap-3 text-blue-800 dark:text-blue-300">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Prescription Required:</span> Some items in your cart require a valid prescription. You can upload it during the checkout step.
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900/60 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-6 flex gap-4 items-center">
                    <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white truncate max-w-[200px] sm:max-w-md">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">{item.product.packSize}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-850 overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-gray-900 dark:text-white">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActivePage("shop")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" /> Continue Shopping
            </button>
          </div>

          {/* Pricing summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Coupon form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-600" /> Apply Coupon
              </h3>
              {couponCode ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Coupon APPLIED: {couponCode}</span>
                    <p className="text-[10px] text-emerald-600">{discountPercentage}% savings activated</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-red-500 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. HEALTH5"
                      className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow">
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
                  <p className="text-[10px] text-gray-400">Available: HEALTH5 (5% Off) | MSCARE20 (20% Off)</p>
                </form>
              )}
            </div>

            {/* Total pricing details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount Applied:</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-800 dark:text-white">Order Total:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{total}</span>
              </div>

              <button
                onClick={() => setActivePage("checkout")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:scale-[1.02]"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
