"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import SliderBanner from "@/components/ui/SliderBanner";
import {
  Package, Upload, Heart, MapPin,
  LogOut, CheckCircle2, Clock, Truck, AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    logout,
    orders,
    prescriptions,
    wishlist,
    addresses,
    deleteAddress,
    products
  } = useApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeSubTab = (tabParam === "wish" || tabParam === "orders" || tabParam === "rx" || tabParam === "addr")
    ? (tabParam as "orders" | "rx" | "wish" | "addr")
    : "orders";

  const sourceProducts = products || [];
  const wProducts = sourceProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Dynamic Health & Offer Slider Banner */}
      <SliderBanner />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* User Card Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
              {user?.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-gray-400 mt-1">{user?.email}</p>

          {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <span className="text-gray-400 font-bold block">Orders</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">{orders.length}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-400 font-bold block">Prescriptions</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">{prescriptions.length}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-6 py-2.5 bg-red-50 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out Account
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-1">
            {[
              { id: "orders", label: "My Orders", icon: Package },
              { id: "rx",     label: "My Prescriptions", icon: Upload },
              { id: "wish",   label: "My Wishlist", icon: Heart },
              { id: "addr",   label: "Saved Addresses", icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => router.push(`/dashboard?tab=${id}`)}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[10px] sm:text-xs font-bold text-center sm:text-left transition-colors ${
                  activeSubTab === id
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area column */}
        <div className="lg:col-span-8 space-y-6">
          {activeSubTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 text-center lg:text-left">My Orders</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center lg:text-left">No orders placed yet.</p>
              ) : (
                orders.map((order) => {
                  const statusColor =
                    order.status === "Delivered" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" :
                    order.status === "Out for Delivery" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400" :
                    order.status === "Processing" ? "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400" :
                    "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
                  const StatusIcon =
                    order.status === "Delivered" ? CheckCircle2 :
                    order.status === "Out for Delivery" ? Truck :
                    Clock;
                  return (
                    <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="text-xs text-gray-400">Order ID: <strong className="text-gray-700 dark:text-white">{order.id}</strong></span>
                          <p className="text-[10px] text-gray-400 mt-0.5">Placed on: {order.date}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusColor}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-32 overflow-y-auto pr-2">
                        {order.items.map((item) => (
                          <div key={item.product.id} className="py-2 flex justify-between items-center text-xs gap-1">
                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{item.product.name} <span className="text-gray-400">×{item.quantity}</span></span>
                            <span className="font-semibold text-gray-800 dark:text-white shrink-0">₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.items.some(item => item.product.prescriptionRequired) && !order.prescriptionUrl && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-2xl text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div>
                            <span className="font-bold block">⚠️ Prescription Required for Delivery</span>
                            This order is currently held at dispatch because a valid doctor's prescription has not been uploaded yet. Please upload it under the "My Prescriptions" tab or during checkout.
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
                        <span className="text-gray-400">Paid via: <strong className="uppercase text-gray-600 dark:text-gray-300">{order.paymentMethod}</strong></span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">Total: ₹{order.total}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeSubTab === "rx" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 text-center lg:text-left">My Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center lg:text-left">No prescriptions uploaded yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full gap-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{rx.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-center">
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Uploaded on: {rx.date}</p>
                      {rx.extractedMedicines && (
                        <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 space-y-1.5 w-full">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-center sm:text-left">OCR MATCHED DRUGS:</span>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                            {rx.extractedMedicines.map((med) => (
                              <span key={med} className="inline-block text-[10px] font-medium bg-gray-50 dark:bg-gray-850 px-2.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "wish" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 text-center lg:text-left">My Wishlist</h3>
              {wProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center lg:text-left">Wishlist empty.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "addr" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 text-center lg:text-left">Saved Addresses</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left pb-14 sm:pb-5 relative">
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">{addr.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{addr.phone}</span>
                    <p className="text-xs text-gray-500 mt-2">
                      {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 text-xs font-bold text-red-500 hover:underline"
                    >
                      Delete Address
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
