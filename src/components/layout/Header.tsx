"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  ShoppingCart, Heart, Search, Menu, X, Sun, Moon,
  Phone, ChevronDown, Shield, Truck, Package, User,
  Bell, LogOut, Settings, ClipboardList, Upload,
  Stethoscope, FlaskConical, Home
} from "lucide-react";

const NAV_LINKS = [
  { label: "Medicines", page: "shop" as const },
  { label: "Upload Rx", page: "upload" as const },
];

export default function Header() {
  const { activePage, setActivePage, cart, wishlist, user, logout } = useApp();
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
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
        <span className="flex items-center gap-1 inline-flex"><Phone className="w-3 h-3" /> 1800-123-CARE (24/7 Support)</span>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-xl shadow-black/10 dark:shadow-black/30 backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <button
              onClick={() => setActivePage("home")}
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-sm">MS</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-black gradient-text leading-none">MS Care</div>
                <div className="text-[10px] text-gray-400 leading-none font-medium tracking-wider">TRUSTED PHARMACY</div>
              </div>
            </button>

            {/* Search bar – desktop */}
            <div className="hidden md:flex flex-1 mx-4">
              <div className="relative w-full group">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, vitamins, devices..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={() => { if (searchQuery.trim()) { setActivePage("shop"); } }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav links – desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => setActivePage(link.page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activePage === link.page
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
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
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setActivePage("dashboard")}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.name}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      </div>
                      {[
                        { label: "Dashboard", icon: User, page: "dashboard" as const },
                        { label: "My Orders", icon: Package, page: "dashboard" as const },
                        { label: "Upload Prescription", icon: Upload, page: "upload" as const },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { setActivePage(item.page); setUserMenuOpen(false); }}
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
            <div className="md:hidden pb-3">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, vitamins..."
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-1.5 rounded-lg">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => { setActivePage(link.page); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activePage === link.page
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}
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
