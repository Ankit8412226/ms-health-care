"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  CreditCard, ShieldCheck, PlusCircle, CheckCircle,
  FileText, Landmark, Wallet, Banknote, MapPin, X, AlertCircle, Loader2
} from "lucide-react";
import { uploadImage, validateUploadFile } from "@/lib/uploadImage";

// Helper function to load Razorpay SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const {
    cart,
    addresses,
    addAddress,
    placeOrder,
    prescriptions,
    setActivePage,
    user,
    discountPercentage,
    uploadPrescription
  } = useApp();

  const [selectedAddrId, setSelectedAddrId] = useState(addresses[0]?.id || "");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [selectedRxUrl, setSelectedRxUrl] = useState("");
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Inline prescription upload, so checkout is never left mid-flow.
  const [rxUploading, setRxUploading] = useState(false);
  const [rxProgress, setRxProgress] = useState(0);
  const [rxError, setRxError] = useState("");

  /**
   * Upload a prescription without leaving checkout, then select it.
   */
  const handleInlineRxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow re-picking the same file after a failure

    setRxError("");

    const validationError = validateUploadFile(file);
    if (validationError) {
      setRxError(validationError);
      return;
    }
    if (!user?.token) {
      setRxError("Please sign in to upload a prescription.");
      return;
    }

    setRxUploading(true);
    setRxProgress(0);
    try {
      const url = await uploadImage(file, "prescription", user.token, setRxProgress);
      const result = await uploadPrescription(file.name, url);
      if (!result.success) {
        setRxError(result.message || "Could not save your prescription. Please try again.");
        return;
      }
      // Select it immediately — the whole point is that the customer can carry
      // straight on to placing the order.
      setSelectedRxUrl(url);
    } catch (err) {
      setRxError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setRxUploading(false);
    }
  };

  // Address Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flat, setFlat] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const requiresRx = cart.some((item) => item.product.prescriptionRequired);

  // Calculate pricing for Razorpay
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * (discountPercentage / 100));
  const deliveryFee = selectedPayment === "cod" ? 99 : (subtotal - discount >= 1100 ? 0 : 49);
  const total = subtotal - discount + deliveryFee;

  // Redirect to Auth if not logged in
  useEffect(() => {
    if (!user) {
      setActivePage("auth");
    }
  }, [user, setActivePage]);

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

  const handlePlaceOrder = async () => {
    if (!selectedAddrId) {
      alert("Please add a delivery address first.");
      return;
    }

    if (selectedPayment === "cod") {
      // placeOrder now reports failure instead of silently faking a placed
      // order, so surface anything that goes wrong.
      const res = await placeOrder(selectedAddrId, selectedPayment, selectedRxUrl);
      if (!res.success) alert(res.message || "Could not place your order. Please try again.");
      return;
    }

    // Prepaid Payment: Launch Razorpay checkout
    setIsProcessingPayment(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your network connection.");
        setIsProcessingPayment(false);
        return;
      }

      // 1. Create order on backend to get Razorpay order_id
      const apiPrefix = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const orderRes = await fetch(`${apiPrefix}/orders/razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user?.token ? `Bearer ${user.token}` : "",
        },
        body: JSON.stringify({ amount: total }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        alert(`Payment Initialization Failed: ${errorData.message || "Unknown error"}`);
        setIsProcessingPayment(false);
        return;
      }

      const orderJson = await orderRes.json();
      const rzpOrder = orderJson.data;

      // 2. Open Razorpay modal
      const options = {
        key: "rzp_live_SwTSEkWxau6fbi", // Live Key ID
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Onco Life India",
        description: "Specialized Oncology & Cancer Care Pharmacy",
        image: "/logo-light.png",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          // 3. Verify Razorpay Payment Signature
          try {
            const verifyRes = await fetch(`${apiPrefix}/orders/razorpay-verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": user?.token ? `Bearer ${user.token}` : "",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              // The signature is forwarded so the server can verify the
              // payment itself when creating the order. It previously received
              // only `paymentStatus: "Paid"` and took the client's word for
              // it, which meant an order could be marked paid without any
              // money changing hands.
              const placed = await placeOrder(selectedAddrId, selectedPayment, selectedRxUrl, {
                transactionId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              if (!placed.success) {
                alert(
                  `Your payment succeeded but the order could not be saved: ${placed.message}\n\n` +
                  `Payment reference: ${response.razorpay_payment_id}\n` +
                  `Please contact support with this reference — you have not been charged twice.`
                );
              }
            } else {
              alert(`Payment verification failed: ${verifyJson.message}`);
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Network connection error verifying the payment signature.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          address: selectedAddrId,
        },
        theme: {
          color: "#059669", // Emerald green
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("An unexpected error occurred while launching Razorpay.");
      setIsProcessingPayment(false);
    }
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
                    className={`p-4 rounded-2xl text-left border transition-all ${selectedRxUrl === rx.url
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
                {/* Inline upload.
                    This used to be `setActivePage("upload")`, which threw the
                    customer out of checkout onto a separate page. After
                    uploading, that page's only exit was "Continue Shopping",
                    so they had to find their way back to checkout and redo
                    their address and payment selections — and the prescription
                    they had just uploaded was not even selected when they got
                    there. Uploading happens here now; the new slip is selected
                    automatically and checkout is never left. */}
                <label
                  className={`p-4 rounded-2xl border-2 border-dashed text-center transition-colors flex flex-col items-center justify-center gap-1.5 ${
                    rxUploading
                      ? "border-blue-400 text-blue-500 cursor-wait"
                      : "border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 cursor-pointer"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
                    className="hidden"
                    disabled={rxUploading}
                    onChange={handleInlineRxUpload}
                  />
                  {rxUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-xs font-bold">Uploading… {rxProgress}%</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-bold">Upload New Prescription</span>
                    </>
                  )}
                </label>
              </div>

              {rxError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{rxError}</p>
              )}
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
                  className={`p-4 rounded-2xl text-left border transition-all relative ${selectedAddrId === addr.id
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
                  className={`p-4 rounded-2xl text-left border transition-all flex gap-3 ${selectedPayment === id
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

            {/* Pricing Summary */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800 dark:text-white">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount ({discountPercentage}%)</span>
                  <span className="font-semibold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <span>
                  Delivery Fee
                  {selectedPayment === "cod" && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded font-black ml-1.5 align-middle">
                      COD CHARGE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-650 dark:text-emerald-400 font-bold">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-800 text-sm font-black text-gray-800 dark:text-white">
                <span>Total Amount</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">₹{total}</span>
              </div>
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
              disabled={addresses.length === 0 || isProcessingPayment}
              className="w-full py-3.5 rounded-xl font-bold transition-all shadow-lg text-center text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Payment...
                </>
              ) : requiresRx && !selectedRxUrl ? (
                "Place Order (Needs Rx for Delivery)"
              ) : (
                "Place Secure Order"
              )}
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
