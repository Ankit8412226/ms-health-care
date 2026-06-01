"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  CreditCard, ShieldCheck, PlusCircle, CheckCircle,
  FileText, Landmark, Wallet, Banknote, MapPin, X, AlertCircle
} from "lucide-react";

export default function CheckoutPage() {
  const {
    cart,
    addresses,
    addAddress,
    placeOrder,
    prescriptions,
    setActivePage
  } = useApp();

  const [selectedAddrId, setSelectedAddrId] = useState(addresses[0]?.id || "");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [selectedRxUrl, setSelectedRxUrl] = useState("");
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);

  // Address Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flat, setFlat] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const requiresRx = cart.some((item) => item.product.prescriptionRequired);

  // Auto-select address if none is selected and addresses are available
  useEffect(() => {
    if (!selectedAddrId && addresses.length > 0) {
      setSelectedAddrId(addresses[0].id);
    }
  }, [addresses, selectedAddrId]);

  // Keep selectedAddrId updated when addresses change (e.g. first address added)
  const previousAddressesLength = useRef(addresses.length);
  useEffect(() => {
    if (addresses.length > previousAddressesLength.current && !selectedAddrId) {
      setSelectedAddrId(addresses[addresses.length - 1].id);
    }
    previousAddressesLength.current = addresses.length;
  }, [addresses, selectedAddrId]);

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !flat || !area || !city || !pincode) return;
    addAddress({ name, phone, flat, area, city, pincode, isDefault });
    setIsAddrModalOpen(false);

    // Reset Form
    setName("");
    setPhone("");
    setFlat("");
    setArea("");
    setCity("");
    setPincode("");
    setIsDefault(false);
  };

  const handlePlaceOrder = () => {
    if (!selectedAddrId) {
      alert("Please add a delivery address first.");
      return;
    }
    placeOrder(selectedAddrId, selectedPayment, selectedRxUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Secure Checkout</h1>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Info Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Prescription Upload / Select */}
          {requiresRx && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                <FileText className="w-5 h-5" /> Medical Prescription Required (Rx)
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                At least one drug in your checkout requires a verified clinical prescription slip. Please select a previously uploaded slip or upload a new one to complete order dispatch verification. You may also place the order now and upload it later from your dashboard.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {prescriptions.map((rx) => (
                  <button
                    key={rx.id}
                    onClick={() => setSelectedRxUrl(rx.url)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      selectedRxUrl === rx.url
                        ? "border-blue-500 bg-white dark:bg-gray-800 shadow-md ring-2 ring-blue-500/20"
                        : "border-gray-200 dark:border-gray-700 bg-white/50 hover:bg-white dark:bg-gray-900/30"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-800 dark:text-white block truncate">{rx.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-1">Uploaded on: {rx.date}</span>
                    <span className="inline-block mt-2 text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {rx.status}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setActivePage("upload")}
                  className="p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center hover:border-blue-500 hover:text-blue-500 transition-colors flex flex-col items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-xs font-bold">Upload New Prescription</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" /> 1. Delivery Address
              </h2>
              <button
                onClick={() => setIsAddrModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Add Address
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddrId(addr.id)}
                  className={`p-4 rounded-2xl text-left border transition-all relative ${
                    selectedAddrId === addr.id
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15 shadow-md ring-2 ring-emerald-500/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">{addr.name}</span>
                  <span className="text-[11px] text-gray-400 block mt-1">{addr.phone}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mt-2 leading-relaxed">
                    {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                  </span>
                  {selectedAddrId === addr.id && (
                    <CheckCircle className="w-5 h-5 text-emerald-600 absolute bottom-3 right-3 fill-white dark:fill-gray-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> 2. Choose Payment Method
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "upi", name: "Instant UPI (Paytm/GPay)", desc: "100% Secure. Recommended.", icon: Landmark },
                { id: "card", name: "Credit / Debit Cards", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
                { id: "wallet", name: "Wallets & Net Banking", desc: "Amazon Pay, HDFC, ICICI", icon: Wallet },
                { id: "cod", name: "Cash on Delivery", desc: "Pay at door. Extra fee may apply.", icon: Banknote },
              ].map(({ id, name, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedPayment(id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex gap-3 ${
                    selectedPayment === id
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/15 shadow-md ring-2 ring-emerald-500/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">{name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Order Review Column */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">Review Order</h3>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800 dark:text-white block truncate">{item.product.name}</span>
                    <span className="text-[10px] text-gray-400 block">{item.quantity} x ₹{item.product.price}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white flex-shrink-0">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {requiresRx && !selectedRxUrl && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  Prescription Required for Delivery
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You can place this order now. However, please note that <strong>your order will only be delivered after you upload a valid prescription</strong>.
                </p>
              </div>
            )}

            {addresses.length === 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl text-[11px] text-red-800 dark:text-red-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  Delivery Address Required
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You must add a delivery address to complete your checkout. Please click <strong>"Add Address"</strong> on the left side to continue.
                </p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-855 p-4 rounded-2xl text-[11px] text-gray-400 space-y-1">
              <div className="flex gap-2 items-center text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Guarantee Safe Checkout
              </div>
              <p>Your connection is encrypted. We fulfill regulatory state medicine delivery procedures under licensed supervision.</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={addresses.length === 0}
              className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-center text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-emerald-500/20 hover:scale-[1.02]"
            >
              {requiresRx && !selectedRxUrl ? "Place Order (Needs Rx for Delivery)" : "Place Secure Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isAddrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <span className="font-bold text-gray-800 dark:text-white">Add Delivery Address</span>
              <button onClick={() => setIsAddrModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddressSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ankit Kumar"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99999 00000"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Flat / House No / Building</label>
                <input
                  required
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  placeholder="e.g. Apartment 405, Tower B"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Area / Sector / Street</label>
                <input
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Sector 62"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">State / City</label>
                  <input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Pincode</label>
                  <input
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 201301"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultAddr"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="defaultAddr" className="text-xs text-gray-500 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md">
                Save &amp; Deliver Here
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
