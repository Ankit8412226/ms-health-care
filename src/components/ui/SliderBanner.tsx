"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Clock, HeartPulse, Truck, Calendar, Baby, Leaf } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp, PageName } from "@/context/AppContext";
import Image from "next/image";

interface Slide {
  id: number;
  tagline: string;
  title: string;
  description: string;
  buttonText: string;
  pageTarget: PageName;
  image: string;
  gradient: string;
  icon: React.ElementType;
  code?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tagline: "Exclusive First Order Offer",
    title: "Flat 30% Discount on Health Essentials",
    description: "Get genuine clinical medicines, daily vitamins, and lab checkups delivered with maximum care and safety.",
    buttonText: "Shop & Save Now",
    pageTarget: "shop",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-emerald-600/90 to-teal-800/90 dark:from-emerald-950/95 dark:to-teal-950/95",
    icon: Sparkles,
    code: "HEALTH30",
  },
  {
    id: 2,
    tagline: "Clinical AI Diagnostics",
    title: "Upload Doctor Slip, Extract in Seconds",
    description: "No more typing complex formulas! Our high-precision OCR technology matches your dosage limits automatically.",
    buttonText: "Upload Prescription",
    pageTarget: "upload",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-blue-600/90 to-indigo-800/90 dark:from-blue-950/95 dark:to-indigo-950/95",
    icon: ShieldCheck,
  },
  {
    id: 3,
    tagline: "Preventive Health Screening",
    title: "Full Body Checkups at Home starting ₹1499",
    description: "Book certified tests covering 82+ crucial body parameters with sterile collection. Reports generated in 12 hours.",
    buttonText: "Schedule Test",
    pageTarget: "labtests",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351167?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-cyan-600/90 to-blue-800/90 dark:from-cyan-950/95 dark:to-blue-950/95",
    icon: HeartPulse,
  },
  {
    id: 4,
    tagline: "Top Tier Telemedicine",
    title: "Consult Verified Specialists Online 24/7",
    description: "Book an instant online consultation via chat, audio, or video. Get medical prescriptions on your dashboard in 10 mins.",
    buttonText: "Consult Doctor",
    pageTarget: "doctors",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-purple-600/90 to-violet-850/90 dark:from-purple-950/95 dark:to-violet-950/95",
    icon: Clock,
  },
  {
    id: 5,
    tagline: "Express Refills",
    title: "Urgent Medicines? 4-Hour Superfast Delivery",
    description: "Enjoy climate-controlled express logistics in Delhi NCR, Mumbai, Bangalore, and Hyderabad for premium potency.",
    buttonText: "Browse Store",
    pageTarget: "shop",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-pink-600/90 to-rose-800/90 dark:from-pink-950/95 dark:to-rose-950/95",
    icon: Truck,
  },
  {
    id: 6,
    tagline: "Refill Subscription",
    title: "Chronic Care Refill at Flat 25% Off",
    description: "Never run out of essential health treatments. Setup automatic monthly refills for diabetes, thyroid, or hypertension meds and save big.",
    buttonText: "Subscribe & Save",
    pageTarget: "shop",
    image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-amber-600/90 to-orange-850/90 dark:from-amber-950/95 dark:to-orange-950/95",
    icon: Calendar,
    code: "REFILL25",
  },
  {
    id: 7,
    tagline: "Mother & Baby Care",
    title: "Premium Care for Mothers & Babies: Up to 40% Off",
    description: "Nurture your little one with top-brand baby food, sensitive skin lotions, gentle soaps, and nursing essentials approved by pediatricians.",
    buttonText: "Explore Baby Care",
    pageTarget: "shop",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-teal-600/90 to-cyan-850/90 dark:from-teal-950/95 dark:to-cyan-950/95",
    icon: Baby,
  },
  {
    id: 8,
    tagline: "Ayurveda & Organic",
    title: "100% Pure Ayurvedic & Natural Health Remedies",
    description: "Boost immunity, improve digestion, and reduce stress with trusted organic supplements, pure herbs, and traditional oils.",
    buttonText: "Shop Organic",
    pageTarget: "shop",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80",
    gradient: "from-green-600/90 to-emerald-850/90 dark:from-green-950/95 dark:to-emerald-950/95",
    icon: Leaf,
  },
];

export default function SliderBanner({ fullWidth = false }: { fullWidth?: boolean }) {
  const { setActivePage } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused]);

  const currentSlide = SLIDES[currentIndex];
  const Icon = currentSlide.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden group ${
        fullWidth
          ? "border-0 shadow-none bg-transparent"
          : "rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
      }`}
    >
      <div className={`relative w-full min-h-[360px] md:min-h-[300px] overflow-hidden bg-gradient-to-br ${currentSlide.gradient} text-white transition-colors duration-700 ${fullWidth ? "" : "rounded-3xl"}`}>
        {/* Dynamic decorative shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl translate-x-20 translate-y-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full relative z-10">
          {/* Text Area */}
          <div className="w-full md:w-3/5 space-y-4 md:space-y-5 text-center md:text-left flex flex-col items-center md:items-start justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 uppercase tracking-wider text-emerald-300">
              <Icon className="w-3.5 h-3.5" />
              {currentSlide.tagline}
            </span>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight max-w-xl text-center md:text-left">
              {currentSlide.title}
            </h2>

            <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed text-center md:text-left">
              {currentSlide.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center md:justify-start">
              <button
                onClick={() => setActivePage(currentSlide.pageTarget)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-emerald-50 text-emerald-700 dark:text-emerald-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 text-center flex justify-center items-center gap-2"
              >
                {currentSlide.buttonText}
              </button>
              {currentSlide.code && (
                <div className="px-4 py-2 border border-dashed border-white/40 rounded-xl bg-white/5 backdrop-blur flex-shrink-0 flex items-center justify-center gap-2">
                  <span className="text-[10px] uppercase font-semibold text-white/60">Code:</span>
                  <span className="text-xs font-black tracking-wider text-emerald-300">{currentSlide.code}</span>
                </div>
              )}
            </div>
          </div>

          {/* Image Area - hidden on small mobile, displayed nicely on desktop and tablets */}
          <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden mt-6 md:mt-0 md:ml-6 lg:ml-8 border border-white/10 shadow-2xl flex-shrink-0">
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle vignette/overlay over the image to blend it in */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Manual Left/Right Controls (hidden on mobile, visible on hover on desktop) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-auto hover:scale-110 z-20 shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-auto hover:scale-110 z-20 shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator Indicators */}
      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "w-6 bg-white shadow" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
