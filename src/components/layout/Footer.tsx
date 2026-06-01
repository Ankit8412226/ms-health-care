"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Heart, Mail, Phone, MapPin, Shield, Truck, Clock, CreditCard } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const { setActivePage, subscribeNewsletter, categories } = useApp();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter a valid email address.", error: true });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const res = await subscribeNewsletter(email);
    setSubmitting(false);
    if (res.success) {
      setMessage({ text: res.message, error: false });
      setEmail("");
    } else {
      setMessage({ text: res.message, error: true });
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 pb-20 md:pb-0">
      {/* Trust badges */}
      <div className="border-b border-gray-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above ₹500" },
              { icon: Shield, title: "100% Genuine", desc: "Licensed pharmacy" },
              { icon: CreditCard, title: "Secure Payment", desc: "SSL encrypted" },
              { icon: Clock, title: "24/7 Support", desc: "Round the clock help" },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4 p-4 rounded-2xl bg-gray-900/30 border border-gray-800/20 hover:border-gray-800/50 hover:bg-gray-850/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:from-emerald-500/25 group-hover:to-teal-500/20 transition-all duration-300 shadow-md">
                  <Icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-350 transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-wide group-hover:text-emerald-300 transition-colors">{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
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
            <button
              onClick={() => setActivePage("home")}
              className="relative h-10 w-40 flex items-center justify-start group cursor-pointer mb-4"
            >
              <Image
                src="/logo-dark.png"
                alt="Oncolife India"
                width={160}
                height={40}
                className="object-contain block select-none"
                style={{ mixBlendMode: "screen" }}
              />
            </button>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              India&apos;s specialized oncology pharmacy delivering genuine CDSCO-certified anti-cancer and critical care medicines with secure cold-chain logistics.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              +91 9540294099
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400 mb-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              support@oncolifeindia.com
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station, Delhi-110007
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
                { label: "Refund & Returns Policy", page: "refund-returns" as const },
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
              {(categories || [])
                .filter((c) => c.id !== "all")
                .slice(0, 4)
                .map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActivePage("shop", `category=${cat.id}`)}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">Get health tips & exclusive discounts delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="w-full max-w-sm">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 w-full"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full sm:w-auto flex items-center justify-center disabled:opacity-50"
                >
                  {submitting ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              {message && (
                <p className={`text-xs mt-2 ${message.error ? "text-rose-450 text-rose-400" : "text-emerald-450 text-emerald-400"}`}>
                  {message.text}
                </p>
              )}
            </form>
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
            <span>© 2026 Oncolife India. All rights reserved. CDSCO Drug License No: DL-XXXXX-XXXX</span>
            <span>Made with <Heart className="w-3 h-3 inline text-red-400" /> in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
