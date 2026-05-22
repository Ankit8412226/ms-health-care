"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS, CATEGORIES, TESTIMONIALS } from "@/data/mockData";
import type { Product } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import Marquee from "@/components/magicui/marquee";
import SliderBanner from "@/components/ui/SliderBanner";
import {
  Search, ArrowRight, Pill, Activity, HeartPulse, Sparkles, Baby, Sun, Leaf,
  ShieldCheck, Truck, Clock, CreditCard, Upload,
  Star, ChevronRight, Smartphone, Play, CheckCircle2, TrendingUp, Tag, X
} from "lucide-react";
import Image from "next/image";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Pill, Activity, HeartPulse, Sparkles, Baby, Sun, Leaf, ShieldCheck,
};

/* ── search helpers ──────────────────────────────────────────────────────── */
const HERO_TRENDING = ["Paracetamol", "Vitamin D3", "Metformin", "Cetaphil", "Omron BP"];

function heroSearchProducts(q: string): Product[] {
  const lq = q.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lq) ||
      (p.saltComposition && p.saltComposition.toLowerCase().includes(lq))
  ).slice(0, 6);
}

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
    if (b < 18.5) return { label: "Underweight", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" };
    if (b < 25) return { label: "Normal Weight", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" };
    if (b < 30) return { label: "Overweight", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800" };
    return { label: "Obese", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" };
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col items-center sm:flex-row gap-3 mb-6 text-center sm:text-left">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-gray-900 dark:text-white">BMI Calculator</h3>
          <p className="text-xs text-gray-400">Body Mass Index — Instant Assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 72"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 175"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 mb-5"
      >
        Calculate My BMI
      </button>

      {bmi !== null && (() => {
        const cat = getCategory(bmi);
        const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
        return (
          <div className={`border rounded-2xl p-5 ${cat.bg} space-y-3`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Your BMI</span>
              <span className={`text-2xl font-black ${cat.color}`}>{bmi}</span>
            </div>
            <div className="w-full h-2 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cat.color.replace("text-", "bg-")}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${cat.color}`}>{cat.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Normal: 18.5–24.9</span>
            </div>
          </div>
        );
      })()}

      {/* BMI Scale Reference */}
      <div className="mt-4 grid grid-cols-4 gap-1 text-center">
        {[
          { label: "Under", range: "< 18.5", color: "bg-amber-400" },
          { label: "Normal", range: "18.5–24.9", color: "bg-emerald-500" },
          { label: "Over", range: "25–29.9", color: "bg-orange-400" },
          { label: "Obese", range: "≥ 30", color: "bg-red-500" },
        ].map((s) => (
          <div key={s.label} className="space-y-1">
            <div className={`h-1.5 rounded-full ${s.color}`} />
            <div className="text-[9px] font-bold text-gray-600 dark:text-gray-400">{s.label}</div>
            <div className="text-[9px] text-gray-400">{s.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Is MS Care a licensed online pharmacy in India?",
    a: "Yes. MS Care holds a valid CDSCO Drug License and operates under the Drugs & Cosmetics Act, 1940. All medicines are sourced directly from licensed manufacturers and distributors."
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
    q: "Are all products listed on MS Care 100% genuine?",
    a: "Absolutely. Every product batch is verified by our licensed pharmacists and traced to its certified manufacturer. We maintain a strict cold chain to ensure drug potency integrity."
  },
];

function HomeFaqWidget() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden transition-all"
        >
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
          >
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{item.q}</span>
            <span
              className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${
                open === idx
                  ? "bg-emerald-600 text-white rotate-45"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              }`}
            >
              +
            </span>
          </button>
          {open === idx && (
            <div className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { setActivePage, setSelectedProductId } = useApp();
  const featured = PRODUCTS.filter((p) => p.bestSeller);

  /* hero search state */
  const [heroQ, setHeroQ] = useState("");
  const [heroOpen, setHeroOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const trimmedHeroQ = heroQ.trim();
  const heroResults = trimmedHeroQ.length >= 2 ? heroSearchProducts(trimmedHeroQ) : [];

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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 w-full border-0">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                India&apos;s #1 Licensed Online Pharmacy
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                <span className="text-gray-900 dark:text-white">Your Health,</span>
                <br />
                <span className="gradient-text">Delivered with Care</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
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
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-5 pr-14 py-4 text-base shadow-xl shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                  {heroQ ? (
                    <button
                      onClick={() => { setHeroQ(""); setHeroOpen(false); }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    onClick={() => { if (heroQ.trim()) { setActivePage("shop"); closeHero(); } else { setActivePage("shop"); } }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:scale-105"
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
                              className="text-xs font-medium px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 transition-all"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => { setActivePage("shop"); closeHero(); }}
                          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 py-2 border-t border-gray-100 dark:border-gray-800 mt-1 pt-3"
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
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors text-left group"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                      <HeroHighlight text={p.name} query={trimmedHeroQ} />
                                    </p>
                                    {p.saltComposition && (
                                      <p className="flex items-center gap-1 mt-0.5">
                                        <span className="shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Salt</span>
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                                          <HeroHighlight text={p.saltComposition} query={trimmedHeroQ} />
                                        </span>
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{p.price}</span>
                                      {p.originalPrice > p.price && (
                                        <span className="text-[10px] text-gray-400 line-through">₹{p.originalPrice}</span>
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
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl py-3 shadow-sm"
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
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={() => setActivePage("shop")}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  Browse Medicines <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePage("upload")}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                >
                  <Upload className="w-4 h-4" /> Upload Prescription
                </button>
              </div>

              {/* Trust stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 pt-4 w-full">
                {[
                  { num: "50L+", label: "Customers" },
                  { num: "1M+", label: "Orders" },
                  { num: "4.9★", label: "Rating" },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{num}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image area */}
            <div className="relative hidden md:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-[3rem] rotate-6" />
                <div className="absolute inset-4 bg-gradient-to-br from-emerald-300/30 to-cyan-300/30 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-[2.5rem] -rotate-3" />
                <div className="absolute inset-8 rounded-[2rem] overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80"
                    alt="Healthcare"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Floating cards */}
                <div className="absolute -left-4 top-1/4 glass-card rounded-2xl p-3 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-white">Free Delivery</div>
                      <div className="text-[10px] text-gray-500">Under 4 hours</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-1/4 glass-card rounded-2xl p-3 shadow-xl animate-float" style={{ animationDelay: "2s" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-white">100% Genuine</div>
                      <div className="text-[10px] text-gray-500">Licensed pharmacy</div>
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
            <p className="text-gray-500 mt-2">Find the right healthcare solutions for your needs</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Pill;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActivePage("shop")}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
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
            {PRODUCTS.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISION & MISSION SECTION ===== */}
      <section className="relative py-24 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white overflow-hidden">
        {/* Overlay grid and glow effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Our Clinical Vision
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                Pioneering Safe &amp; Trusted Digital Pharmacy Operations
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                At MS Care, our vision is to solve chronic medical supply chains by combining deep pharmaceutical expertise, rigorous quality control operations, and intelligent AI automation. We believe everyone deserves direct access to genuine healthcare without regulatory compromises.
              </p>
              <div className="space-y-4 pt-4 w-full">
                {[
                  { title: "Clinical Grade Sourcing", desc: "Every drug strip is certified through licensed batch verification pipelines." },
                  { title: "AI-Powered Diagnostics", desc: "Automated OCR prescription verification system built for error-free patient dosage limits." },
                  { title: "Eco-Conscious Packaging", desc: "We utilize climate-controlled, sustainable packaging to safeguard pharmaceutical potency." }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center md:items-start text-center md:text-left">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-xs font-bold sm:mt-1 flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Glass Card Mockup */}
            <div className="relative">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
                
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Quality Shield
                  </span>
                </div>

                <div className="space-y-4">
                  <span className="text-xl sm:text-2xl font-black block">Safety Assurance Guarantee</span>
                  <p className="text-xs text-gray-350 leading-relaxed">
                    &quot;We pledge to provide absolute compliance with the CDSCO rules, maintaining cold chain integrity and verified pharmacist reviews on 100% of orders dispatch.&quot;
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-gray-200">Certified Chemists Board</span>
                      <span className="text-[10px] text-gray-400">Governance &amp; Medical Operations</span>
                    </div>
                  </div>
                </div>
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
            <button onClick={() => setActivePage("shop")} className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:gap-2 transition-all text-sm">
              Explore Health Library <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Understanding Type 2 Diabetes Management",
                category: "Diabetes",
                readTime: "5 min read",
                image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&auto=format&fit=crop&q=60",
                desc: "Discover daily meal habits, lifestyle tracking, and the role of metformin in keeping blood glucose balanced."
              },
              {
                title: "Statins & Heart Health: Myths vs Facts",
                category: "Cardio",
                readTime: "7 min read",
                image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=500&auto=format&fit=crop&q=60",
                desc: "Learn how Atorvastatin protects arterial pathways, regulates bad LDL cholesterol, and facts surrounding cardiovascular protection."
              },
              {
                title: "The Ultimate Guide to Daily Vitamin Supplements",
                category: "Vitamins",
                readTime: "4 min read",
                image: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop&q=60",
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
                  <button onClick={() => setActivePage("shop")} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center md:justify-start gap-1.5 hover:gap-2 transition-all">
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
            "name": "MS Care Online Pharmacy",
            "image": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600",
            "@id": "https://mscare.com",
            "url": "https://mscare.com",
            "telephone": "1800-123-CARE",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Plot No. 12, Tech Sector 62",
              "addressLocality": "Noida",
              "addressRegion": "Uttar Pradesh",
              "postalCode": "201301",
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
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Why Choose MS Care?</h2>
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
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">What Our Customers Say</h2>
            <p className="text-gray-500 mt-2">Real reviews from verified patients &amp; customers</p>
          </div>
        </div>
        <Marquee pauseOnHover className="[--duration:30s]">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="w-80 mx-3 p-6 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 relative">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-400">Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ===== APP DOWNLOAD ===== */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-white space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">Download the MS Care App</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Get exclusive app-only discounts, real-time order tracking, instant prescription uploads, and 24/7 doctor consultations.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button className="flex items-center gap-3 bg-black/30 hover:bg-black/50 backdrop-blur rounded-xl px-5 py-3 transition-all hover:scale-105">
                  <Play className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">GET IT ON</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-black/30 hover:bg-black/50 backdrop-blur rounded-xl px-5 py-3 transition-all hover:scale-105">
                  <Smartphone className="w-7 h-7" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">DOWNLOAD ON</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-emerald-100 w-full">
                <span>★ 4.9 Rating</span>
                <span>•</span>
                <span>10M+ Downloads</span>
                <span>•</span>
                <span>Free</span>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative w-52 h-96 bg-black/20 backdrop-blur rounded-[2.5rem] border-2 border-white/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-black">MS</span>
                  </div>
                  <div className="text-lg font-bold">MS Care</div>
                  <div className="text-xs opacity-60 mt-1">Your Health, Our Priority</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Stay Healthy, Stay Informed</h2>
          <p className="text-gray-500 mb-8">Subscribe to get weekly health tips, exclusive deals, and early access to new features.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
