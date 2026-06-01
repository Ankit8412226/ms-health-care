"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp, PageName } from "@/context/AppContext";
import { Product } from "@/types";
import Image from "next/image";
import {
  ShoppingCart, Heart, Search, Menu, X, Sun, Moon,
  Phone, ChevronDown, ChevronRight, Package, User,
  LogOut, Upload, Home, Pill, Tag, ArrowRight, TrendingUp, Clock, ArrowLeft
} from "lucide-react";


const TRENDING_SEARCHES = ["Paracetamol", "Vitamin D3", "Metformin", "Omron BP Monitor", "Cetaphil"];
const QUICK_CATEGORIES = [
  { label: "Diabetes Care", cat: "diabetes" },
  { label: "Heart Health", cat: "heart" },
  { label: "Vitamins", cat: "vitamins" },
  { label: "Skin Care", cat: "skin" },
  { label: "Ayurvedic", cat: "ayurvedic" },
  { label: "Baby Care", cat: "baby" },
];

/* ── highlight matched text ─────────────────────────────────────────────── */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const NAV_LINKS = [
  { label: "Medicines", page: "shop" as const },
  { label: "Upload Rx", page: "upload" as const },
];

interface SearchDropdownProps {
  trimmedQ: string;
  resultProducts: Product[];
  hasResults: boolean;
  setSearchQuery: (q: string) => void;
  setDropdownOpen: (open: boolean) => void;
  closeDropdown: () => void;
  setActivePage: (page: PageName, query?: string) => void;
  setSelectedProductId: (id: string) => void;
}

function SearchDropdown({
  trimmedQ,
  resultProducts,
  hasResults,
  setSearchQuery,
  setDropdownOpen,
  closeDropdown,
  setActivePage,
  setSelectedProductId,
}: SearchDropdownProps) {
  const { categories } = useApp();
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-[200] animate-scale-in">
      {/* ── Idle state: show trending + categories ── */}
      {trimmedQ.length < 2 && (
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    setDropdownOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 transition-all"
                >
                  <Clock className="w-3 h-3 opacity-50" />
                  {term}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Browse Categories</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(categories.length > 0 ? categories : QUICK_CATEGORIES.map(qc => ({ id: qc.cat, name: qc.label }))).filter((c: any) => c.id !== "all").slice(0, 6).map((cat: any) => (
                <button
                  key={cat.id || cat.cat}
                  type="button"
                  onClick={() => {
                    setActivePage("shop");
                    closeDropdown();
                  }}
                  className="text-[11px] font-semibold px-2 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors border border-emerald-100 dark:border-emerald-900/40 text-center"
                >
                  {cat.name || cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Active search results ── */}
      {trimmedQ.length >= 2 && (
        <div className="max-h-[420px] overflow-y-auto">
          {!hasResults ? (
            <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-6 h-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No medicines found</p>
                <p className="text-xs text-gray-400 mt-1">Try searching by brand name or composition</p>
              </div>
            </div>
          ) : (
            <>
              {/* Section header */}
              <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <Pill className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Medicines &amp; Products
                </span>
                <span className="ml-auto text-[10px] text-gray-400">{resultProducts.length} found</span>
              </div>

              {/* Result rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {resultProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setActivePage("details", `id=${p.id}`);
                      closeDropdown();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 transition-colors text-left group"
                  >
                    {/* Product image */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shadow-sm">
                      <Image src={p.image} alt={p.name} width={44} height={44} className="w-full h-full object-cover" />
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-snug">
                        <Highlight text={p.name} query={trimmedQ} />
                      </p>
                      {p.salt && (
                        <p className="flex items-center gap-1 mt-0.5">
                          <span className="shrink-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Salt</span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            <Highlight text={p.salt} query={trimmedQ} />
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

                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Footer CTA */}
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    if (trimmedQ) {
                      setActivePage("shop");
                      closeDropdown();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-xl py-2.5 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  See all results for &ldquo;{trimmedQ}&rdquo;
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const { activePage, setActivePage, cart, wishlist, user, logout, setSelectedProductId, products, categories } = useApp();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  /* derived search results */
  const trimmedQ = searchQuery.trim();
  const sourceProducts = products || [];
  const resultProducts = trimmedQ.length >= 2 ? sourceProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmedQ.toLowerCase()) ||
      (p.salt && p.salt.toLowerCase().includes(trimmedQ.toLowerCase()))
  ).slice(0, 5) : [];
  const hasResults = resultProducts.length > 0;

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setSearchQuery("");
  }, []);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideDesktop = searchRef.current && searchRef.current.contains(target);
      const clickedInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* Lock body scrolling when mobile menu drawer is open */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prevScrolled) => {
        if (prevScrolled !== isScrolled) {
          return isScrolled;
        }
        return prevScrolled;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  return (
    <>
      {/* Top banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 text-white text-xs py-2 px-4 text-center hidden md:block">
        <span className="font-medium">🚚 Free delivery on orders above ₹500</span>
        <span className="mx-4 opacity-50">|</span>
        <span>🏷️ Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded">HEALTH30</span> for 30% off</span>
        <span className="mx-4 opacity-50">|</span>
        <span className="flex items-center gap-1 inline-flex"><Phone className="w-3 h-3" /> +91 9540294099 (Call & Whatsapp)</span>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-lg shadow-emerald-950/5 dark:shadow-emerald-950/20 backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-emerald-500/10 dark:border-emerald-900/30"
          : "bg-white/85 dark:bg-gray-950/85 backdrop-blur-md border-b border-gray-150/40 dark:border-gray-900/40"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Back Button for mobile when not on Home */}
            {activePage !== "home" && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    setActivePage("home");
                  }
                }}
                className="md:hidden p-2 -ml-2 rounded-xl text-gray-705 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Logo */}
            <button
              onClick={() => setActivePage("home")}
              className="relative h-11 w-44 flex items-center justify-start flex-shrink-0 group cursor-pointer"
            >
              <Image
                src="/logo-light.png"
                alt="Oncolife India"
                width={176}
                height={44}
                priority
                className="object-contain block dark:hidden select-none transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ mixBlendMode: "multiply" }}
              />
              <Image
                src="/logo-dark.png"
                alt="Oncolife India"
                width={176}
                height={44}
                priority
                className="object-contain hidden dark:block select-none transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ mixBlendMode: "screen" }}
              />
            </button>

            {/* Search bar – desktop */}
            <div className="hidden md:flex flex-1 mx-4" ref={searchRef}>
              <div className="relative w-full">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setDropdownOpen(true);
                  }}
                  placeholder="Search medicines, salt compositions..."
                  className="w-full bg-gray-50/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-700/80 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400 font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-600 focus:shadow-md focus:shadow-emerald-500/5"
                />
                <button
                  onClick={() => { if (searchQuery.trim()) { setActivePage("shop"); closeDropdown(); } }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <SearchDropdown
                    trimmedQ={trimmedQ}
                    resultProducts={resultProducts}
                    hasResults={hasResults}
                    setSearchQuery={setSearchQuery}
                    setDropdownOpen={setDropdownOpen}
                    closeDropdown={closeDropdown}
                    setActivePage={setActivePage}
                    setSelectedProductId={setSelectedProductId}
                  />
                )}
              </div>
            </div>


            {/* Nav links – desktop */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => setActivePage(link.page)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    activePage === link.page
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100/50 dark:border-emerald-900/30"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto lg:ml-0">
              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setDark(!dark)}
                className="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setActivePage("dashboard", "tab=wish")}
                className="hidden md:flex relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setActivePage("cart")}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[80px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden z-50">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-205 truncate">{user.name}</div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                        </div>
                        {[
                          { label: "Dashboard", icon: User, page: "dashboard" as const, query: undefined },
                          { label: "My Orders", icon: Package, page: "dashboard" as const, query: "tab=orders" },
                          { label: "Upload Prescription", icon: Upload, page: "upload" as const, query: undefined },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { setActivePage(item.page, item.query); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <item.icon className="w-4 h-4 text-emerald-600" />
                            {item.label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setActivePage("auth")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">Login</span>
                  </button>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3" ref={mobileSearchRef}>
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setDropdownOpen(true);
                  }}
                  placeholder="Search medicines, vitamins..."
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={() => { if (searchQuery.trim()) { setActivePage("shop"); closeDropdown(); } }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <SearchDropdown
                    trimmedQ={trimmedQ}
                    resultProducts={resultProducts}
                    hasResults={hasResults}
                    setSearchQuery={setSearchQuery}
                    setDropdownOpen={setDropdownOpen}
                    closeDropdown={closeDropdown}
                    setActivePage={setActivePage}
                    setSelectedProductId={setSelectedProductId}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <div className="absolute top-0 right-0 bottom-0 w-full bg-white dark:bg-gray-950 shadow-2xl flex flex-col animate-slide-in-right z-10">

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="relative h-9 w-36 flex items-center justify-start group">
                  <Image
                    src="/logo-light.png"
                    alt="Oncolife India"
                    width={144}
                    height={36}
                    className="object-contain block dark:hidden select-none"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  <Image
                    src="/logo-dark.png"
                    alt="Oncolife India"
                    width={144}
                    height={36}
                    className="object-contain hidden dark:block select-none"
                    style={{ mixBlendMode: "screen" }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDark(!dark)}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* User profile strip */}
                {user && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-800 dark:text-white leading-tight truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</div>
                    </div>
                  </div>
                )}

                {/* Nav links */}
                <div className="px-3 py-3 space-y-1">
                  {[
                    { label: "Home", page: "home" as const, icon: Home, query: undefined },
                    { label: "Shop Medicines", page: "shop" as const, icon: Package, query: undefined },
                    { label: "Upload Rx", page: "upload" as const, icon: Upload, query: undefined },
                    { label: "My Wishlist", page: "dashboard" as const, icon: Heart, query: "tab=wish" },
                  ].map(({ label, page, icon: Icon, query }) => (
                    <button
                      key={label}
                      onClick={() => { setActivePage(page, query); setMobileOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center gap-3 ${
                        activePage === page
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${activePage === page ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-gray-100 dark:border-gray-800 my-1" />

                {/* Account actions */}
                <div className="px-3 py-3 space-y-1">
                  {user ? (
                    <>
                      <button
                        onClick={() => { setActivePage("dashboard"); setMobileOpen(false); }}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="flex-1">My Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      </button>
                      <button
                        onClick={() => { setActivePage("dashboard", "tab=orders"); setMobileOpen(false); }}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-3"
                      >
                        <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="flex-1">My Orders</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Footer — stays pinned at bottom */}
              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                {user ? (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setActivePage("auth"); setMobileOpen(false); }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all text-center shadow-lg shadow-emerald-500/25"
                  >
                    Login / Sign Up
                  </button>
                )}
                <div className="text-[10px] text-center text-gray-400">Call & Whatsapp: +91 9540294099</div>
              </div>
            </div>
          </div>
        )}

      </header>

      {/* Mobile bottom sticky nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80 safe-area-pb">
        <div className="grid grid-cols-4 py-2">
          {[
            { icon: Home, label: "Home", page: "home" as const },
            { icon: Package, label: "Shop", page: "shop" as const },
            { icon: Upload, label: "Upload Rx", page: "upload" as const },
            { icon: User, label: "Account", page: user ? "dashboard" as const : "auth" as const },
          ].map(({ icon: Icon, label, page }) => (
            <button
              key={label}
              onClick={() => setActivePage(page)}
              className={`flex flex-col items-center gap-1 py-1 transition-colors ${
                activePage === page
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {label === "Shop" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Backdrop for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
