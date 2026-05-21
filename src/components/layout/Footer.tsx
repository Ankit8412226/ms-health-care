"use client";
import { useApp } from "@/context/AppContext";
import { Heart, Mail, Phone, MapPin, Shield, Truck, Clock, CreditCard } from "lucide-react";

export default function Footer() {
  const { setActivePage } = useApp();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 pb-20 md:pb-0">
      {/* Trust badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹500" },
              { icon: Shield, title: "100% Genuine", desc: "Licensed pharmacy" },
              { icon: CreditCard, title: "Secure Payment", desc: "SSL encrypted" },
              { icon: Clock, title: "24/7 Support", desc: "Round the clock help" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex flex-col items-center md:flex-row gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">MS</span>
              </div>
              <div className="text-center md:text-left">
                <div className="text-lg font-black text-white">MS Care</div>
                <div className="text-[10px] text-gray-500 tracking-wider">TRUSTED PHARMACY</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              India&apos;s most trusted online pharmacy delivering genuine medicines, health devices, and wellness products at your doorstep.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              1800-123-CARE
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              support@mscare.in
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Noida, Uttar Pradesh, India
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left col-span-1">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", page: "about" as const },
                { label: "Contact Us", page: "contact" as const },
                { label: "FAQs", page: "faq" as const },
                { label: "Privacy Policy", page: "privacy" as const },
                { label: "Terms of Service", page: "terms" as const },
              ].map(({ label, page }) => (
                <li key={label}>
                  <button onClick={() => setActivePage(page)} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left col-span-1">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2.5">
              {["Diabetes Care", "Heart Health", "Vitamins & OTC", "Baby Care", "Skin Care", "Ayurvedic"].map((cat) => (
                <li key={cat}>
                  <button onClick={() => setActivePage("shop")} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">Get health tips & exclusive discounts delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 w-full"
              />
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full sm:w-auto">
                Subscribe
              </button>
            </div>
            <div className="mt-6 flex flex-col items-center md:items-start">
              <h5 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">We Accept</h5>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {["Visa", "MC", "UPI", "COD"].map((m) => (
                  <span key={m} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs font-medium text-gray-300">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 text-center sm:text-left">
            <span>© 2026 MS Care Pharmacy Pvt. Ltd. All rights reserved. Drug License No: DL-XXXXX-XXXX</span>
            <span>Made with <Heart className="w-3 h-3 inline text-red-400" /> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
