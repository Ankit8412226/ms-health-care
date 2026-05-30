"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Product, Category } from "@/types";

// ── API Base URL ────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function generateOrderId(): string {
  return `OD-${Math.floor(100000 + Math.random() * 900000)}`;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  flat: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  address: UserAddress;
  paymentMethod: string;
  date: string;
  status: "Placed" | "Processing" | "Out for Delivery" | "Delivered";
  prescriptionUrl?: string;
  prescriptionStatus?: "Pending Review" | "Approved" | "Rejected";
}

export interface Prescription {
  id: string;
  name: string;
  url: string;
  date: string;
  status: "Processing (OCR)" | "Verified" | "Rejected";
  extractedMedicines?: string[];
}

export type PageName =
  | "home"
  | "shop"
  | "details"
  | "cart"
  | "checkout"
  | "success"
  | "dashboard"
  | "auth"
  | "upload"
  | "about"
  | "contact"
  | "faq"
  | "privacy"
  | "terms";

export type AuthMode = "login" | "signup" | "forgot" | "otp";

interface AppContextType {
  activePage: PageName;
  setActivePage: (page: PageName, query?: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number, showCrossSell?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  user: { name: string; email: string; phone: string; token?: string; role?: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  otpEmail: string;
  setOtpEmail: (email: string) => void;
  addresses: UserAddress[];
  addAddress: (addr: Omit<UserAddress, "id">) => void;
  deleteAddress: (id: string) => void;
  orders: Order[];
  placeOrder: (addressId: string, paymentMethod: string, prescriptionUrl?: string) => void;
  prescriptions: Prescription[];
  uploadPrescription: (name: string, url: string) => void;
  couponCode: string;
  discountPercentage: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  addedProduct: Product | null;
  setAddedProduct: (product: Product | null) => void;
  products: Product[];
  loading: boolean;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updatePrescriptionStatus: (rxId: string, status: Prescription["status"], extractedMedicines?: string[]) => void;
  updateProductPrice: (productId: string, price: number) => void;
  deleteProduct: (productId: string) => void;
  addProduct: (product: Product) => void;
  categories: { id: string; name: string; icon: string }[];
  addCategory: (name: string) => void;
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;
  getProductById: (id: string) => Promise<Product | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Helper: Map MongoDB doc → frontend Product ──────────────────────────
function mapApiProduct(p: Record<string, unknown>): Product {
  return {
    id: (p._id as string) || (p.id as string) || "",
    name: (p.name as string) || "",
    slug: (p.slug as string) || "",
    description: (p.description as string) || "",
    shortDescription: (p.shortDescription as string) || "",
    price: (p.price as number) || 0,
    regularPrice: (p.regularPrice as number) || 0,
    onSale: (p.onSale as boolean) || false,
    rating: (p.rating as number) || 0,
    reviewCount: (p.reviewCount as number) || 0,
    category: (p.category as string) || "",
    categoryName: (p.categoryName as string) || "",
    brand: (p.brand as string) || "",
    images: (p.images as Product["images"]) || [],
    image: (p.image as string) || "",
    salt: (p.salt as string) || "",
    dosage: (p.dosage as string) || "",
    manufacturer: (p.manufacturer as string) || "",
    prescriptionRequired: (p.prescriptionRequired as boolean) || false,
    packSize: (p.packSize as string) || "",
    storage: (p.storage as string) || "",
    howToUse: (p.howToUse as string) || "",
    sideEffects: (p.sideEffects as string[]) || [],
    benefits: (p.benefits as string) || "",
  };
}

// ── Icon mapping for categories ─────────────────────────────────────────
const CATEGORY_ICON_MAP: Record<string, string> = {
  transplant: "HeartPulse",
  diabetes: "Activity",
  heart: "HeartPulse",
  vitamins: "Sparkles",
  devices: "ShieldAlert",
  baby: "Baby",
  skin: "Sun",
  ayurvedic: "Leaf",
  prescription: "Pill",
  uncategorized: "LayoutGrid",
  "anti-cancer": "ShieldAlert",
  "kidney-care": "Activity",
  "liver-care": "Activity",
  "eye-care": "Sun",
  vaccine: "ShieldAlert",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getActivePageFromPath = (path: string): PageName => {
    const cleanPath = path.replace(/^\//, "");
    if (!cleanPath) return "home";
    const validPages: PageName[] = [
      "home", "shop", "details", "cart", "checkout", "success",
      "dashboard", "auth", "upload",
      "about", "contact", "faq", "privacy", "terms"
    ];
    if (validPages.includes(cleanPath as PageName)) {
      return cleanPath as PageName;
    }
    return "home";
  };

  const activePage = getActivePageFromPath(pathname);

  // ── State ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>("p1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; phone: string; token?: string; role?: string } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // ── Load user from localStorage on mount ──────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mscare_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Fetch products & categories from API on mount ─────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      // 1. Fetch initial limited products for instant load
      const resLimit = await fetch(`${API_URL}/products?limit=24`);
      if (resLimit.ok) {
        const json = await resLimit.json();
        if (json.success && json.data) {
          const mapped = json.data.map(mapApiProduct);
          setProducts(mapped);
        }
      }
      setLoading(false); // Enable interactive state immediately

      // 2. Fetch the remaining products in the background after page mounts
      setTimeout(async () => {
        try {
          const resAll = await fetch(`${API_URL}/products`);
          if (resAll.ok) {
            const jsonAll = await resAll.json();
            if (jsonAll.success && jsonAll.data) {
              const mapped = jsonAll.data.map(mapApiProduct);
              setProducts(mapped);
            }
          }
        } catch (err) {
          console.warn("Background progressive fetch failed:", err);
        }
      }, 800); // 800ms delay to let the initial animation/render complete smoothly

    } catch (err) {
      console.warn("API unreachable:", err);
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const allCat = { id: "all", name: "All Products", icon: "LayoutGrid" };
          const mapped = json.data.map((c: Record<string, unknown>) => ({
            id: (c.slug as string) || (c._id as string),
            name: c.name as string,
            icon: CATEGORY_ICON_MAP[(c.slug as string) || ""] || (c.icon as string) || "LayoutGrid",
          }));
          setCategories([allCat, ...mapped]);
        }
      }
    } catch (err) {
      console.warn("Categories API unreachable, using fallback:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // ── Navigation ────────────────────────────────────────────────────────
  const setActivePage = (page: PageName, query?: string) => {
    const basePath = page === "home" ? "/" : `/${page}`;
    const targetPath = query ? `${basePath}?${query}` : basePath;
    router.push(targetPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Cart ──────────────────────────────────────────────────────────────
  const addToCart = (product: Product, qty: number = 1, showCrossSell: boolean = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    if (showCrossSell) {
      setAddedProduct(product);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // ── Wishlist ──────────────────────────────────────────────────────────
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // ── Auth (Real API) ───────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const userData = {
          name: json.data.name,
          email: json.data.email,
          phone: json.data.phone || "",
          token: json.data.token,
          role: json.data.role,
        };
        setUser(userData);
        localStorage.setItem("mscare_user", JSON.stringify(userData));
        setActivePage("home");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAddresses([]);
    setOrders([]);
    setPrescriptions([]);
    localStorage.removeItem("mscare_user");
    setActivePage("home");
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const userData = {
          name: json.data.name,
          email: json.data.email,
          phone: phone,
          token: json.data.token,
          role: json.data.role,
        };
        setUser(userData);
        localStorage.setItem("mscare_user", JSON.stringify(userData));
        setActivePage("home");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ── Addresses (client-side for now) ───────────────────────────────────
  const addAddress = (addr: Omit<UserAddress, "id">) => {
    const newAddr: UserAddress = {
      ...addr,
      id: `a_${Date.now()}`,
    };
    if (newAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  // ── Orders (client-side for demo) ─────────────────────────────────────
  const placeOrder = (addressId: string, paymentMethod: string, prescriptionUrl?: string) => {
    const address = addresses.find((a) => a.id === addressId) || addresses[0];
    if (!address) return;
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = Math.round(subtotal * (discountPercentage / 100));
    const deliveryFee = subtotal - discount > 500 ? 0 : 49;
    const total = subtotal - discount + deliveryFee;

    const newOrder: Order = {
      id: generateOrderId(),
      items: [...cart],
      subtotal,
      discount,
      deliveryFee,
      total,
      address,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
      status: "Placed",
      prescriptionUrl,
      prescriptionStatus: prescriptionUrl ? "Pending Review" : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    removeCoupon();
    setActivePage("success");
  };

  // ── Prescriptions ─────────────────────────────────────────────────────
  const uploadPrescription = (name: string, url: string) => {
    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      name,
      url,
      date: new Date().toISOString().split("T")[0],
      status: "Processing (OCR)",
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    setTimeout(() => {
      setPrescriptions((prevList) =>
        prevList.map((item) => {
          if (item.id === newRx.id) {
            return {
              ...item,
              status: "Verified" as const,
              extractedMedicines: ["Metformin Glycomet 500mg SR", "Atorvastatin Lipivas 10mg"],
            };
          }
          return item;
        })
      );
    }, 4000);
  };

  // ── Admin Ops ─────────────────────────────────────────────────────────
  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const updatePrescriptionStatus = (rxId: string, status: Prescription["status"], extractedMedicines?: string[]) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id === rxId) {
          const updated = { ...p, status };
          if (extractedMedicines) {
            updated.extractedMedicines = extractedMedicines;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const updateProductPrice = (productId: string, price: number) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === productId ? { ...prod, price } : prod))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== productId));
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [...prev, product]);
  };

  const addCategory = (name: string) => {
    const newCat = {
      id: name.toLowerCase().trim().replace(/\s+/g, "-"),
      name: name.trim(),
      icon: "Folder",
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // ── Coupons ───────────────────────────────────────────────────────────
  const applyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === "HEALTH30") {
      setCouponCode("HEALTH30");
      setDiscountPercentage(30);
      return true;
    } else if (cleanCode === "MSCARE20") {
      setCouponCode("MSCARE20");
      setDiscountPercentage(20);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountPercentage(0);
  };

  const subscribeNewsletter = useCallback(async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/newsletters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return {
        success: res.ok,
        message: data.message || (res.ok ? "Subscribed successfully!" : "Failed to subscribe."),
      };
    } catch (err) {
      console.error("Newsletter error:", err);
      return { success: false, message: "Network error occurred." };
    }
  }, []);

  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        return mapApiProduct(data.data);
      }
      return null;
    } catch (err) {
      console.error("Get product details error:", err);
      return null;
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedProductId,
        setSelectedProductId,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlist,
        toggleWishlist,
        user,
        login,
        logout,
        signup,
        authMode,
        setAuthMode,
        otpEmail,
        setOtpEmail,
        addresses,
        addAddress,
        deleteAddress,
        orders,
        placeOrder,
        prescriptions,
        uploadPrescription,
        couponCode,
        discountPercentage,
        applyCoupon,
        removeCoupon,
        addedProduct,
        setAddedProduct,
        products,
        loading,
        updateOrderStatus,
        updatePrescriptionStatus,
        updateProductPrice,
        deleteProduct,
        addProduct,
        categories,
        addCategory,
        subscribeNewsletter,
        getProductById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
