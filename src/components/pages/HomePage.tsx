"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import Marquee from "@/components/magicui/marquee";
import SliderBanner from "@/components/ui/SliderBanner";
import {
  Search, ArrowRight, Pill, Activity, HeartPulse, Sparkles, Baby, Sun, Leaf,
  ShieldCheck, ShieldAlert, LayoutGrid, Folder, Truck, Clock, CreditCard, Upload,
  Star, ChevronRight, Smartphone, Play, CheckCircle2, TrendingUp, Tag, X,
  Mail, MapPin, Bone, Droplet, Wind, Syringe, Heart, Moon
} from "lucide-react";
import Image from "next/image";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Pill, Activity, HeartPulse, Sparkles, Baby, Sun, Leaf, ShieldCheck, ShieldAlert, LayoutGrid, Folder,
  Bone, Droplet, Wind, Syringe, Heart, Moon,
};

/* ── search helpers ──────────────────────────────────────────────────────── */
const HERO_TRENDING = ["Paracetamol", "Vitamin D3", "Metformin", "Cetaphil", "Omron BP"];

function HeroHighlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-200 dark:bg-emerald-800/70 text-emerald-800 dark:text-emerald-200 rounded px-0.5 not-italic font-bold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ──────────────────────────────────────────────
// Inline Sub-Components
// ──────────────────────────────────────────────

function BmiCalculatorWidget() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return;
    setBmi(parseFloat((w / (h * h)).toFixed(1)));
  };

  const getCategory = (b: number) => {
    if (b < 18.5) return { 
      label: "Underweight", 
      color: "text-amber-500 dark:text-amber-400", 
      bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30",
      barColor: "bg-amber-500",
      advice: "Consider speaking with a practitioner about a balanced nutritional roadmap."
    };
    if (b < 25) return { 
      label: "Healthy Weight", 
      color: "text-emerald-600 dark:text-emerald-400", 
      bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30",
      barColor: "bg-emerald-500",
      advice: "Superb! Maintain your active physical routine and balanced whole-foods diet."
    };
    if (b < 30) return { 
      label: "Overweight", 
      color: "text-orange-500 dark:text-orange-400", 
      bg: "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/20 dark:border-orange-500/30",
      barColor: "bg-orange-500",
      advice: "Adopting regular cardio schedules and managing calorie density can help optimize weight."
    };
    return { 
      label: "Obese", 
      color: "text-rose-500 dark:text-rose-400", 
      bg: "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 dark:border-rose-500/30",
      barColor: "bg-rose-500",
      advice: "Consulting a clinical dietitian is highly recommended to mitigate cardiovascular risks."
    };
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-emerald-500/5">
      {/* Decorative gradients */}
      <div className="absolute -right-16 -top-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col items-center sm:flex-row gap-4 mb-6 text-center sm:text-left relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 animate-pulse-glow">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5 justify-center sm:justify-start">
            Clinical BMI Calculator <Sparkles className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Evaluate body mass index against World Health Organization criteria</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">Body Weight (kg)</label>
          <div className="relative rounded-xl overflow-hidden shadow-sm group">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 72"
              className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">KG</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">Stature Height (cm)</label>
          <div className="relative rounded-xl overflow-hidden shadow-sm group">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 175"
              className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-semibold"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-emerald-500 transition-colors">CM</span>
          </div>
        </div>
      </div>

      <button
        onClick={calculate}
        className="shine-effect w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-700 hover:via-teal-600 hover:to-cyan-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer relative z-10"
      >
        Calculate Assessment
      </button>

      {bmi !== null && (() => {
        const cat = getCategory(bmi);
        const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
        return (
          <div className={`mt-6 border rounded-2xl p-5 ${cat.bg} space-y-4 animate-scale-in relative z-10`}>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Estimated Score</span>
                <div className={`text-3xl font-black ${cat.color}`}>{bmi} <span className="text-xs font-normal text-gray-455 dark:text-gray-500">kg/m²</span></div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Classification</span>
                <div className={`text-base font-extrabold tracking-tight ${cat.color}`}>{cat.label}</div>
              </div>
            </div>

            {/* Premium Sliding Gauge */}
            <div className="space-y-1.5">
              <div className="relative w-full h-3 bg-gray-200/50 dark:bg-black/40 rounded-full overflow-hidden border border-white/10 dark:border-black/20">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-400 via-emerald-500 to-rose-500`}
                  style={{ width: `${pct}%` }}
                />
                {/* Pointer marker */}
                <div 
                  className="absolute top-0 w-1 h-3 bg-white shadow-md transition-all duration-1000 ease-out"
                  style={{ left: `calc(${pct}% - 2px)` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-gray-450 dark:text-gray-505">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>

            <p className="text-xs text-gray-650 dark:text-gray-350 font-medium leading-relaxed">
              <span className="font-bold text-gray-800 dark:text-white">Advice:</span> {cat.advice}
            </p>
          </div>
        );
      })()}

      {/* BMI Scale Reference */}
      <div className="mt-6 grid grid-cols-4 gap-2 text-center border-t border-gray-100 dark:border-gray-800/80 pt-4 relative z-10">
        {[
          { label: "Under", range: "< 18.5", color: "bg-amber-400" },
          { label: "Normal", range: "18.5–24.9", color: "bg-emerald-500" },
          { label: "Over", range: "25–29.9", color: "bg-orange-400" },
          { label: "Obese", range: "≥ 30", color: "bg-red-500" },
        ].map((s) => (
          <div key={s.label} className="space-y-1 group">
            <div className={`h-1.5 rounded-full ${s.color} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="text-[9px] font-black text-gray-800 dark:text-gray-300 tracking-wide uppercase">{s.label}</div>
            <div className="text-[9px] text-gray-450 dark:text-gray-400 font-medium">{s.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


const FAQ_ITEMS = [
  {
    q: "Is Onco Life India a licensed online pharmacy in India?",
    a: "Yes. Onco Life India holds a valid CDSCO Drug License and operates under the Drugs & Cosmetics Act, 1940. All medicines are sourced directly from licensed manufacturers and distributors."
  },
  {
    q: "How do I upload my prescription to order medicines?",
    a: "Navigate to 'Upload Rx' from the navigation bar. You can photograph or attach your doctor's prescription. Our AI OCR system reads it in seconds and extracts the medicine names automatically."
  },
  {
    q: "How quickly will my medicines be delivered?",
    a: "We offer express delivery within 4 hours in Delhi NCR, Mumbai, Bangalore, and Hyderabad for qualifying orders. Standard delivery is next-day across 20,000+ pin codes in India."
  },
  {
    q: "Can I return medicines if they are damaged or wrong?",
    a: "Yes, we offer a 100% replacement or full refund policy for damaged, expired, or incorrectly delivered medicines. Contact our 24/7 support team with your order ID and a photo for instant resolution."
  },
  {
    q: "Are all products listed on Onco Life India 100% genuine?",
    a: "Absolutely. Every product batch is verified by our licensed pharmacists and traced to its certified manufacturer. We maintain a strict cold chain to ensure drug potency integrity."
  },
];

function HomeFaqWidget() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div
            key={idx}
            className={`transition-all duration-300 rounded-2xl border ${
              isOpen
                ? "bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border-emerald-500/30 dark:border-emerald-500/40 shadow-md shadow-emerald-500/5"
                : "bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : idx)}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left gap-4 cursor-pointer group"
            >
              <span className={`text-sm font-bold leading-snug transition-colors ${
                isOpen ? "text-emerald-700 dark:text-emerald-350" : "text-gray-800 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-450"
              }`}>{item.q}</span>
              <span
                className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-xs ${
                  isOpen
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rotate-45 shadow-lg shadow-emerald-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-xs sm:text-sm text-gray-655 dark:text-gray-400 leading-relaxed border-t border-emerald-500/10 dark:border-emerald-500/20 pt-4 animate-scale-in font-medium">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const FALLBACK_CATEGORIES = [
  { id: "prescription", name: "Prescription Drugs",  icon: "Pill"        },
  { id: "transplant",   name: "Transplant",           icon: "HeartPulse"  },
  { id: "diabetes",     name: "Diabetes Care",        icon: "Activity"    },
  { id: "heart",        name: "Heart Health",         icon: "HeartPulse"  },
  { id: "vitamins",     name: "Vitamins & OTC",       icon: "Sparkles"    },
  { id: "devices",      name: "Health Devices",       icon: "ShieldAlert" },
  { id: "baby",         name: "Baby Care",            icon: "Baby"        },
  { id: "skin",         name: "Skin Care",            icon: "Sun"         },
  { id: "ayurvedic",    name: "Ayurvedic",            icon: "Leaf"        },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Dr. Ramesh Mehta",
    role: "Senior Oncologist",
    text: "Onco Life India has revolutionized how my patients access oncology and critical care medicines. Fast delivery and 100% genuine products.",
    rating: 5,
    avatar: "/avatar-ramesh.png"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Chronic Patient",
    text: "I order my transplant medicines monthly. The pricing is transparent and customer care assists with prescription validation so smoothly.",
    rating: 5,
    avatar: "/avatar-sneha.png"
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Caregiver",
    text: "Their AI OCR prescription scanner makes ordering complex medicines extremely easy. Highly recommended for senior care.",
    rating: 5,
    avatar: "/avatar-amit.png"
  }
];

export default function HomePage() {
  const { setActivePage, setSelectedProductId, products, categories, subscribeNewsletter } = useApp();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Contact Us form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill in all fields.");
      return;
    }
    if (!contactEmail.includes("@")) {
      setContactError("Please enter a valid email address.");
      return;
    }
    setContactSubmitting(true);
    setContactError("");
    setContactSuccess(false);
    
    // Simulate contact form submission
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1500);
  };

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

  const sourceProducts = products || [];
  const sourceCategories = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;
  const featured = sourceProducts.filter((p) => p.onSale).slice(0, 8);

  /* hero search state */
  const [heroQ, setHeroQ] = useState("");
  const [heroOpen, setHeroOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const trimmedHeroQ = heroQ.trim();
  const heroResults = trimmedHeroQ.length >= 2 ? sourceProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmedHeroQ.toLowerCase()) ||
      (p.salt && p.salt.toLowerCase().includes(trimmedHeroQ.toLowerCase()))
  ).slice(0, 6) : [];

  const closeHero = useCallback(() => {
    setHeroOpen(false);
  }, []);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heroRef.current && !heroRef.current.contains(e.target as Node)) {
        setHeroOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHeroOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50/60 via-teal-50/60 to-cyan-50/60 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-950 w-full border-0 bg-grid">
        {/* Fading radial grid mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-950 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,white_90%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,oklch(0.09_0.01_240)_90%)] pointer-events-none z-0" />

        {/* Decorative glowing blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float z-0" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl z-0" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                India&apos;s #1 Licensed Online Pharmacy
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">Your Health,</span>
                <br />
                <span className="gradient-text drop-shadow-[0_1px_1px_rgba(16,185,129,0.05)]">Delivered with Care</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-650 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
                Order genuine clinical medicines, health essentials, vitamins &amp; upload medical prescriptions online — all with 100% CDSCO safety.
              </p>

              {/* Search bar */}
              <div className="relative w-full max-w-lg mx-auto md:mx-0" ref={heroRef}>
                <div className="relative">
                  <input
                    value={heroQ}
                    onChange={(e) => {
                      setHeroQ(e.target.value);
                      setHeroOpen(true);
                    }}
                    onFocus={() => setHeroOpen(true)}
                    placeholder="Search medicines, salt compositions..."
                    className="w-full bg-white/95 dark:bg-gray-850 border border-gray-200/80 dark:border-gray-800 rounded-2xl pl-5 pr-14 py-4 text-base shadow-xl shadow-emerald-500/5 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all dark:text-white font-medium hover:border-gray-350 dark:hover:border-gray-700"
                  />
                  {heroQ ? (
                    <button
                      onClick={() => { setHeroQ(""); setHeroOpen(false); }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => { if (heroQ.trim()) { setActivePage("shop"); closeHero(); } else { setActivePage("shop"); } }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* ── Hero Search Dropdown ────────────────────── */}
                {heroOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-[100] animate-scale-in">

                    {/* Idle: trending chips */}
                    {trimmedHeroQ.length < 2 && (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trending</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {HERO_TRENDING.map((term) => (
                            <button
                              key={term}
                              onClick={() => { setHeroQ(term); setHeroOpen(true); }}
                              className="text-xs font-semibold px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => { setActivePage("shop"); closeHero(); }}
                          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 py-2 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3 cursor-pointer"
                        >
                          <Tag className="w-3.5 h-3.5" /> Browse all medicines
                        </button>
                      </div>
                    )}

                    {/* Active search results */}
                    {trimmedHeroQ.length >= 2 && (
                      <div className="max-h-[400px] overflow-y-auto">
                        {heroResults.length === 0 ? (
                          <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Search className="w-5 h-5 opacity-40" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No medicines found</p>
                              <p className="text-xs text-gray-400 mt-1">Try brand name or salt like &ldquo;Paracetamol&rdquo;</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Section label */}
                            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                              <Pill className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Medicines &amp; Products</span>
                              <span className="ml-auto text-[10px] text-gray-400">{heroResults.length} found</span>
                            </div>

                            {/* Result rows */}
                            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                              {heroResults.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => { setSelectedProductId(p.id); setActivePage("details", `id=${p.id}`); setHeroQ(""); closeHero(); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors text-left group cursor-pointer"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 shadow-sm bg-white">
                                    <Image src={p.image} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                      <HeroHighlight text={p.name} query={trimmedHeroQ} />
                                    </p>
                                    {p.salt && (
                                      <p className="flex items-center gap-1 mt-0.5">
                                        <span className="shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Salt</span>
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                          <HeroHighlight text={p.salt} query={trimmedHeroQ} />
                                        </span>
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{p.price}</span>
                                      {p.regularPrice > p.price && (
                                        <span className="text-[10px] text-gray-400 line-through">₹{p.regularPrice}</span>
                                      )}
                                      {p.prescriptionRequired && (
                                        <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded">Rx</span>
                                      )}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                </button>
                              ))}
                            </div>

                            {/* Footer CTA */}
                            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                              <button
                                onClick={() => { setActivePage("shop"); closeHero(); }}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl py-3 shadow-sm cursor-pointer"
                              >
                                <Search className="w-4 h-4" />
                                See all results for &ldquo;{trimmedHeroQ}&rdquo;
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3.5 justify-center md:justify-start">
                <button
                  onClick={() => setActivePage("shop")}
                  className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/45 hover:scale-102 cursor-pointer"
                >
                  Browse Medicines <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePage("upload")}
                  className="flex items-center gap-2 px-7 py-3.5 bg-white/60 dark:bg-gray-850/60 backdrop-blur-md border border-gray-250 dark:border-gray-850 text-emerald-800 dark:text-emerald-350 font-bold rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Upload className="w-4 h-4" /> Upload Prescription
                </button>
              </div>

              {/* Trust stats */}
              <div className="flex items-center justify-center md:justify-start gap-8 pt-4 w-full border-t border-gray-200/50 dark:border-gray-800/40">
                {[
                  { num: "50L+", label: "Customers" },
                  { num: "1M+", label: "Orders" },
                  { num: "4.9★", label: "Rating" },
                ].map(({ num, label }) => (
                  <div key={label} className="flex flex-col items-center md:items-start">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{num}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image area */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-[3rem] rotate-6 scale-95" />
                <div className="absolute inset-4 bg-gradient-to-br from-emerald-300/30 to-cyan-300/30 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-[2.5rem] -rotate-3 scale-95" />
                <div className="absolute inset-8 rounded-[2rem] overflow-hidden shadow-2xl border border-white/50 dark:border-gray-800/40">
                  <Image
                    src="/image copy 3.png"
                    alt="Healthcare"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Floating cards */}
                <div className="absolute -left-4 top-1/4 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-emerald-500/10 dark:border-emerald-900/30 rounded-2xl p-3.5 shadow-2xl animate-float cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow shadow-emerald-500/20">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">Free Delivery</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Under 4 hours</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/4 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-blue-500/10 dark:border-blue-900/30 rounded-2xl p-3.5 shadow-2xl animate-float cursor-default" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow shadow-blue-500/20">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 dark:text-white">100% Genuine</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Licensed pharmacy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Health & Offer Slider Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SliderBanner fullWidth={false} />
      </div>



      {/* ===== CATEGORIES ===== */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-gray-500 mt-2 font-medium">Find the right healthcare solutions for your needs</p>
          </div>
          
          {/* Categories Grid */}
          {(() => {
            const filteredCats = sourceCategories.filter((c) => c.id !== "all");
            const displayedCats = showAllCategories ? filteredCats : filteredCats.slice(0, 8);
            const hasMore = filteredCats.length > 8;

            return (
              <div className="space-y-8">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {displayedCats.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.icon] || Pill;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActivePage("shop", `category=${cat.id}`)}
                        className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:scale-105 active:scale-95 text-left w-full block"
                      >
                        <div className="h-full w-full rounded-2xl bg-white dark:bg-gray-905 p-4 flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 group-hover:from-emerald-100 group-hover:to-teal-100 dark:group-hover:from-emerald-900/40 dark:group-hover:to-teal-900/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{cat.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold rounded-xl border border-emerald-250 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-650 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {showAllCategories ? "View Less" : "View More Categories"}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left mb-10 gap-4 w-full">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Featured Products</h2>
              <p className="text-gray-500 mt-1">Top-rated medicines &amp; health essentials</p>
            </div>
            <button onClick={() => setActivePage("shop")} className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <button onClick={() => setActivePage("shop")} className="text-emerald-600 font-semibold">
              View All Products →
            </button>
          </div>
        </div>
      </section>

      {/* ===== ALL PRODUCTS PREVIEW ===== */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left mb-10 gap-4 w-full">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Trending Medicines</h2>
              <p className="text-gray-500 mt-1">Most ordered this week</p>
            </div>
            <button onClick={() => setActivePage("shop")} className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all">
              Shop All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sourceProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISION & MISSION SECTION (ABOUT US) ===== */}
      <section className="relative py-24 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white overflow-hidden">
        {/* Intersecting grid background pattern */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        {/* Overlay gradient mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-emerald-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left side: Premium Image Frame & Compound Cards */}
            <div className="relative order-2 md:order-1">
              <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
                {/* Decorative border frames */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-[2.5rem] rotate-3 scale-[1.02]" />
                
                {/* Main Image */}
                <div className="absolute inset-2 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                  <Image
                    src="/image copy 4.png"
                    alt="Onco Life India Sourcing Lab"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Overlapping Floating Operational Stats Card */}
                <div className="absolute -right-4 -bottom-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl max-w-[200px] animate-float">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Certified Chemists</span>
                  </div>
                  <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                    100% orders verified by licensed pharmacy practitioners.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: About Us Content */}
            <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold px-4 py-2 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                About Onco Life India Online Pharmacy
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Pioneering Safe &amp; Trusted Clinical Supply Chains
              </h2>
              
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                At Onco Life India, our mission is to eliminate friction in chronic healthcare management. We combine high-precision pharmaceutical storage, climate-controlled cold-chain shipping, and AI-enabled prescription analysis to ensure every medicine arriving at your doorstep retains 100% clinical efficacy.
              </p>
              
              <div className="space-y-4 pt-2 w-full">
                {[
                  { title: "Rigorous Sourcing Protocols", desc: "Every medicine batch is sourced directly from certified manufacturers and verified by licensed pharmacists." },
                  { title: "AI-Powered Diagnostics OCR", desc: "Our high-precision OCR pipeline translates hand-written prescriptions into structured dosage plans within seconds." },
                  { title: "Eco-Conscious Potency Packaging", desc: "We utilize temperature-regulated and biodegradable packaging to preserve vaccine and liquid formulation integrity." }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3.5 items-center md:items-start text-center md:text-left group">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/35 flex items-center justify-center text-emerald-300 text-xs font-bold sm:mt-0.5 flex-shrink-0 group-hover:scale-105 duration-200">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100 text-sm tracking-wide">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HEALTH UTILITY TOOLS ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-150 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left intro text */}
            <div className="lg:col-span-5 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Interactive Health</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                Evaluate Your Wellness Instantly
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Use our automated health metric calculators to screen key variables like BMI. Knowledge is the first step toward preventive healthcare.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 flex-1 flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="text-2xl font-black text-emerald-600">18.5 - 24.9</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Healthy BMI Index Range</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 flex-1 flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="text-2xl font-black text-cyan-600">2-3 Litres</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Recommended Water Intake</span>
                </div>
              </div>
              <div className="w-full pt-2 flex justify-center lg:justify-start">
                <button
                  onClick={() => setActivePage("calculator")}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-355 font-bold hover:gap-3 transition-all text-xs uppercase tracking-wider group cursor-pointer"
                >
                  Try D.Pharm Pediatric Dosage Calculator
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Interactive Calculator Widget */}
            <div className="lg:col-span-7">
              <BmiCalculatorWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ===== HEALTH & WELLNESS BLOG ===== */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between text-center md:text-left mb-12 gap-4 w-full">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Health Library</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">Wellness &amp; Health Insights</h2>
            </div>
            <button onClick={() => setActivePage("blog")} className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all text-sm">
              Explore Health Library <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Understanding Type 2 Diabetes Management",
                category: "Diabetes",
                readTime: "5 min read",
                image: "/image.png",
                desc: "Discover daily meal habits, lifestyle tracking, and the role of metformin in keeping blood glucose balanced."
              },
              {
                title: "Statins & Heart Health: Myths vs Facts",
                category: "Cardio",
                readTime: "7 min read",
                image: "/image copy.png",
                desc: "Learn how Atorvastatin protects arterial pathways, regulates bad LDL cholesterol, and facts surrounding cardiovascular protection."
              },
              {
                title: "The Ultimate Guide to Daily Vitamin Supplements",
                category: "Vitamins",
                readTime: "4 min read",
                image: "/image copy 2.png",
                desc: "Are you taking enough Vitamin D3 and B12? Learn how daily multivitamins replenish trace minerals and support immunity."
              }
            ].map((post, idx) => (
              <div key={idx} className="group flex flex-col bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-150/50 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between items-center text-center md:items-start md:text-left space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold block text-center md:text-left">{post.readTime}</span>
                    <h3 className="text-base font-bold text-gray-850 dark:text-white leading-snug group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 text-center md:text-left">
                      {post.desc}
                    </p>
                  </div>
                  <button onClick={() => setActivePage("blog", `id=${idx}`)} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center md:justify-start gap-1.5 hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOME ACCORDION FAQ ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Help Center</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Common Questions Answered</h2>
          </div>

          <HomeFaqWidget />
        </div>
      </section>

      {/* Schema.org JSON-LD for Local Pharmacy (SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Pharmacy",
            "name": "Onco Life India Online Pharmacy",
            "image": "https://www.oncolifeindia.com/image.png",
            "@id": "https://www.oncolifeindia.com",
            "url": "https://www.oncolifeindia.com",
            "telephone": "+91 95402 94099",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station",
              "addressLocality": "Delhi",
              "addressRegion": "Delhi",
              "postalCode": "110007",
              "addressCountry": "IN"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "00:00",
              "closes": "23:59"
            }
          })
        }}
      />

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Why Choose Onco Life India?</h2>
            <p className="text-gray-500 mt-2">Trusted by 50 lakh+ customers across India</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Truck, title: "Express Delivery", desc: "Under 4 hours in metros" },
              { icon: ShieldCheck, title: "100% Genuine", desc: "Verified medicines only" },
              { icon: CreditCard, title: "Secure Payments", desc: "PCI DSS compliant" },
              { icon: Clock, title: "24/7 Support", desc: "Always here for you" },
              { icon: CheckCircle2, title: "Licensed Pharmacy", desc: "CDSCO approved" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden relative bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Trusted by Thousands</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-medium text-sm">See how Onco Life India helps families across India manage their health and medicine prescriptions effortlessly.</p>
          </div>
        </div>
        <Marquee pauseOnHover className="[--duration:40s] relative z-10">
          {TESTIMONIALS.map((t) => (
            <div 
              key={t.id} 
              className="w-80 mx-4 p-6 sm:p-7 bg-white dark:bg-gray-900/80 rounded-3xl border border-gray-150/70 dark:border-gray-800/80 shadow-md hover:shadow-xl hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-350 leading-relaxed font-medium mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800/80 pt-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative border border-emerald-500/10 flex-shrink-0">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white leading-tight">{t.name}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Verified Patient</div>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ===== APP DOWNLOAD ===== */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-emerald-950 to-cyan-950 text-white relative overflow-hidden border-t border-emerald-950/20">
        {/* Intersecting grid background pattern */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 uppercase tracking-widest">
                Mobile Healthcare
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Manage Your Healthcare From the App
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                Get exclusive app-only discounts, real-time prescription approvals, medicine refills, and active video consultations with practitioners.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full">
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-black/10">
                  <Play className="w-7 h-7 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-70 font-semibold uppercase tracking-wider">GET IT ON</div>
                    <div className="text-sm font-black">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-black/10">
                  <Smartphone className="w-7 h-7 text-emerald-400" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-70 font-semibold uppercase tracking-wider">DOWNLOAD ON</div>
                    <div className="text-sm font-black">App Store</div>
                  </div>
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs font-bold text-gray-300 w-full">
                <span className="flex items-center gap-1 text-amber-400">★ 4.9 <span className="text-gray-400 font-medium">Rating</span></span>
                <span className="text-emerald-500">•</span>
                <span>10M+ Downloads</span>
                <span className="text-emerald-500">•</span>
                <span>Free to Install</span>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hidden md:flex justify-center relative">
              {/* Decorative behind glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Smartphone Outer Shell */}
              <div className="relative w-[280px] h-[550px] bg-gray-950 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800 ring-1 ring-white/10 overflow-hidden hover:scale-103 transition-transform duration-500">
                {/* Notch / Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full border border-gray-800" />
                  <div className="w-4 h-1 bg-gray-900 rounded-full" />
                </div>

                {/* Inner Screen */}
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-900 border border-white/5 flex flex-col justify-between p-4 pt-10 text-white font-sans">
                  {/* Mock Status Bar */}
                  <div className="absolute top-1 left-0 right-0 px-6 flex justify-between items-center text-[10px] text-gray-400 font-bold select-none z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2 bg-emerald-500 rounded-xs" />
                      <span className="opacity-80">5G</span>
                      <div className="w-4 h-2 border border-gray-400 rounded-xs p-0.5 flex items-center"><div className="w-full h-full bg-emerald-500 rounded-2xs" /></div>
                    </div>
                  </div>

                  {/* App Branding Mini Screen */}
                  <div className="flex-1 flex flex-col justify-between py-4">
                    {/* App Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                          <span className="text-[10px] font-black text-white">OL</span>
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold leading-none">Onco Life India</div>
                          <span className="text-[7px] text-emerald-400 font-bold tracking-wider">ONLINE</span>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-[8px]">🔔</span>
                      </div>
                    </div>

                    {/* Search bar mockup */}
                    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 mb-3 flex items-center gap-1.5 text-left">
                      <span className="text-gray-500 text-[10px]">🔍</span>
                      <span className="text-[9px] text-gray-400 font-semibold">Search medicines, salts...</span>
                    </div>

                    {/* Quick Health Stats Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/5 border border-emerald-500/20 rounded-2xl p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-bold text-emerald-400">Order #MSC-9281</span>
                        <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black uppercase">Out for Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          🚚
                        </div>
                        <div className="flex-1">
                          <div className="text-[8px] text-gray-400">Arriving in approx</div>
                          <div className="text-[11px] font-extrabold text-white">18 Minutes</div>
                        </div>
                      </div>
                      {/* Tracking Progress Bar */}
                      <div className="w-full h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                      </div>
                    </div>

                    {/* Prescription Scan Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] font-extrabold text-white">Prescription Scanner</div>
                          <span className="text-[7px] text-gray-400">Extract medicines in seconds</span>
                        </div>
                        <span className="text-[7px] font-extrabold bg-emerald-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">AI OCR</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          📄
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-gray-200 font-sans">Diabetes Care Rx.pdf</div>
                          <div className="text-[7px] text-emerald-400 font-sans">Verified • 2 Items Extracted</div>
                        </div>
                      </div>

                      <div className="mt-2.5 py-1 text-center bg-emerald-500 hover:bg-emerald-600 text-black text-[9px] font-black rounded-lg transition-colors cursor-pointer">
                        Scan & Order Now
                      </div>
                    </div>
                  </div>

                  {/* App Bottom Nav mockup */}
                  <div className="border-t border-white/5 pt-2 flex justify-around text-gray-500 text-[9px] font-bold">
                    <div className="text-emerald-400 flex flex-col items-center gap-0.5"><span className="text-xs">🏠</span><span>Home</span></div>
                    <div className="flex flex-col items-center gap-0.5"><span className="text-xs">💊</span><span>Shop</span></div>
                    <div className="flex flex-col items-center gap-0.5"><span className="text-xs">📤</span><span>Upload Rx</span></div>
                    <div className="flex flex-col items-center gap-0.5"><span className="text-xs">👤</span><span>Account</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT US SECTION ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-150 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Connect With Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Let&apos;s Start a Conversation</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Have questions about custom dosages, billing, prescription status, or clinic setups? Send us a message, and our verified clinical executives will respond.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Contact Info Card */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="p-8 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white rounded-3xl space-y-8 shadow-xl border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="text-xl font-bold mb-2">Clinical Care Desk</h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    Our registered pharmacists are available to resolve medicine-related queries or prescription queries.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200 block uppercase tracking-wider font-bold">Call & Whatsapp Us</span>
                      <span className="text-sm font-bold block">+91 95402 94099</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200 block uppercase tracking-wider font-bold">Email Query</span>
                      <span className="text-sm font-bold block">support@oncolifeindia.com</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-200 block uppercase tracking-wider font-bold">Corporate Office</span>
                      <span className="text-sm font-bold block leading-snug">Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station, Delhi-110007</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl flex gap-3 text-xs leading-relaxed font-medium">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-500" />
                <span>
                  <strong>Medical Emergency Notice:</strong> Onco Life India online portal is for scheduled anti-cancer medicine purchases. If you are experiencing an acute clinical emergency, please visit the nearest local hospital immediately.
                </span>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-center">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Send Patient Inquiry</h3>

                {contactError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl">
                    {contactError}
                  </div>
                )}

                {contactSuccess && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold rounded-xl">
                    Thank you! Your message has been received by our clinical desk. We will respond shortly.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Ankit Kumar"
                      className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. ankit@gmail.com"
                      className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest">Inquiry Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your inquiry, medicine requirement, or support details..."
                    className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-205 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {contactSubmitting ? "Submitting Inquiry..." : "Submit Inquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Stay Healthy, Stay Informed</h2>
          <p className="text-gray-500 mb-8">Subscribe to get weekly health tips, exclusive deals, and early access to new features.</p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex-shrink-0 disabled:opacity-50"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {message && (
              <p className={`text-sm font-medium ${message.error ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
