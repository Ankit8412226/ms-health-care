"use client";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function SuccessPage() {
  const { setActivePage, orders } = useApp();
  const latestOrder = orders[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="inline-flex w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
        Your order has been placed successfully. A copy of the invoice and dispatch tracking links have been sent to your email.
      </p>

      {latestOrder && (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-md text-left mb-8 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 font-bold uppercase">Order Reference</span>
            <span className="text-xs font-bold text-gray-800 dark:text-white">{latestOrder.id}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Recipient Name:</span>
              <span className="font-semibold text-gray-800 dark:text-white">{latestOrder.address.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Mode:</span>
              <span className="font-semibold text-gray-800 dark:text-white uppercase">{latestOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{latestOrder.total}</span>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl flex gap-3 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div className="text-[10px] leading-relaxed">
              <strong>Supervised Verification:</strong> Our clinical pharmacist is reviewing your order details. Verification status updates will arrive via SMS within 15 minutes.
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setActivePage("dashboard")}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          Track My Order
        </button>
        <button
          onClick={() => setActivePage("shop")}
          className="px-6 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-colors"
        >
          Keep Shopping
        </button>
      </div>
    </div>
  );
}
