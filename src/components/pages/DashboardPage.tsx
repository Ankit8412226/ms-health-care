"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import SliderBanner from "@/components/ui/SliderBanner";
import { useState } from "react";
import {
  Package, Upload, Heart, MapPin,
  LogOut, CheckCircle2, Clock, Truck, AlertCircle,
  Navigation, X, ExternalLink, RefreshCw, MapPinned,
  Info, Loader2
} from "lucide-react";

interface TrackingModalProps {
  orderId: string;
  onClose: () => void;
}

function TrackingModal({ orderId, onClose }: TrackingModalProps) {
  const { trackOrder, orders } = useApp();
  const order = orders.find((o) => o.id === orderId);

  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trackOrder(orderId);
      setTrackData(result);
      setFetched(true);
    } catch {
      setError("Could not fetch tracking info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ["Placed", "Processing", "Out for Delivery", "Delivered"];
  const currentStep = statusSteps.indexOf(order?.status || "Placed");

  const trackingEvents: any[] = trackData?.trackingData?.shipment_track_activities || [];
  const liveStatus = trackData?.trackingData?.shipment_track?.[0]?.current_status;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Track Your Order</h3>
                <p className="text-xs text-emerald-100 mt-0.5">{orderId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Progress Steps */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Progress</p>
            <div className="relative">
              {/* Track line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-emerald-500 z-0 transition-all duration-700"
                style={{ width: `${currentStep >= 0 ? (currentStep / (statusSteps.length - 1)) * 100 : 0}%`, right: 'unset' }}
              />
              <div className="relative z-10 grid grid-cols-4 gap-1">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      idx <= currentStep
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400"
                    }`}>
                      {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[9px] font-bold text-center leading-tight ${
                      idx <= currentStep ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                    }`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Courier info */}
          {(order?.awbCode || trackData?.awbCode) && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                <MapPinned className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white">
                  {order?.courierName || trackData?.courierName || "Courier Assigned"}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                  AWB: <span className="text-gray-700 dark:text-gray-200">{order?.awbCode || trackData?.awbCode}</span>
                </p>
                {liveStatus && (
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    📦 {liveStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* No AWB yet */}
          {!order?.awbCode && !trackData?.awbCode && fetched && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-200">Shipment Not Yet Dispatched</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Your order is being prepared. Tracking will be available once the shipment is picked up by our courier partner.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-4 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Live tracking events */}
          {trackingEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking History</p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {trackingEvents.slice(0, 10).map((ev: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${idx === 0 ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{ev.activity || ev["sr-status-label"] || "Update"}</p>
                      <p className="text-[10px] text-gray-400">{ev.date} {ev.time ? `• ${ev.time}` : ""} {ev.location ? `• ${ev.location}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fetch / Refresh button */}
          <button
            onClick={fetchTracking}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Fetching Live Status...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> {fetched ? "Refresh Tracking" : "Get Live Tracking"}</>
            )}
          </button>

          {/* External tracking link */}
          {(order?.trackingUrl || trackData?.trackingUrl) && (
            <a
              href={order?.trackingUrl || trackData?.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Track on Shiprocket Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    user,
    logout,
    orders,
    prescriptions,
    wishlist,
    addresses,
    deleteAddress,
    products,
    attachPrescriptionToOrder
  } = useApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeSubTab = (tabParam === "wish" || tabParam === "orders" || tabParam === "rx" || tabParam === "addr")
    ? (tabParam as "orders" | "rx" | "wish" | "addr")
    : "orders";

  const sourceProducts = products || [];
  const wProducts = sourceProducts.filter((p) => wishlist.includes(p.id));

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

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
                    order.status === "Cancelled" ? "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400" :
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
                          {order.courierName && (
                            <p className="text-[10px] text-blue-500 mt-0.5">🚚 {order.courierName} • AWB: {order.awbCode}</p>
                          )}
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
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex flex-col gap-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-650 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-amber-900 dark:text-amber-200">⚠️ Prescription Required for Delivery</span>
                              This order contains prescription-only items. Please attach an uploaded prescription scan below to verify and proceed with dispatch.
                            </div>
                          </div>
                          
                          {prescriptions.length > 0 ? (
                            <div className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40">
                              <select
                                id={`select-rx-${order.id}`}
                                className="bg-transparent text-xs text-gray-700 dark:text-gray-200 font-bold focus:outline-none cursor-pointer flex-1 w-full p-1"
                                defaultValue=""
                              >
                                <option value="" disabled>-- Select Uploaded Prescription --</option>
                                {prescriptions.map(rx => (
                                  <option key={rx.id} value={rx.url}>{rx.name} ({rx.date})</option>
                                ))}
                              </select>
                              <button
                                onClick={async () => {
                                  const selectEl = document.getElementById(`select-rx-${order.id}`) as HTMLSelectElement;
                                  if (selectEl && selectEl.value) {
                                    const success = await attachPrescriptionToOrder(order.id, selectEl.value);
                                    if (success) {
                                      alert("Prescription linked to order successfully!");
                                    } else {
                                      alert("Failed to link prescription. Please try again.");
                                    }
                                  } else {
                                    alert("Please select a prescription first.");
                                  }
                                }}
                                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Link Prescription
                              </button>
                            </div>
                          ) : (
                            <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-amber-200/50">
                              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mb-2">No prescriptions uploaded yet.</p>
                              <button
                                onClick={() => router.push('/upload')}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                Go to Upload Page
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <span className="text-gray-400">Paid via: <strong className="uppercase text-gray-600 dark:text-gray-300">{order.paymentMethod}</strong></span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">Total: ₹{order.total}</span>
                        </div>

                        {/* Track Order Button */}
                        <button
                          onClick={() => setTrackingOrderId(order.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Track Order
                        </button>
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
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start w-full gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{rx.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-center">
                          {rx.status}
                        </span>
                      </div>
                      {rx.url && (
                        <div className="relative w-full h-32 bg-gray-55 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center">
                          <img
                            src={rx.url}
                            alt={rx.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full pt-1">
                        <p className="text-[10px] text-gray-400">Uploaded on: {rx.date}</p>
                        {rx.url && (
                          <a
                            href={rx.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> View Scan
                          </a>
                        )}
                      </div>
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

      {/* Tracking Modal */}
      {trackingOrderId && (
        <TrackingModal
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
        />
      )}
    </div>
  );
}
