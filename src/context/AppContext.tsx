"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Product, PRODUCTS } from "@/data/mockData";

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
  user: { name: string; email: string; phone: string } | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  signup: (name: string, email: string, phone: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Deriving activePage from current pathname
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

  const [selectedProductId, setSelectedProductId] = useState<string>("p1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["p3", "p5", "p6"]);
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>({
    name: "Ankit Kumar",
    email: "ankit@mscare.com",
    phone: "+91 98765 43210",
  });
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([
    {
      id: "a1",
      name: "Ankit Kumar",
      phone: "+91 98765 43210",
      flat: "Penthouse C, Cloud Heights",
      area: "Sector 62, Noida",
      city: "Uttar Pradesh",
      pincode: "201301",
      isDefault: true,
    },
    {
      id: "a2",
      name: "Ankit Kumar (Office)",
      phone: "+91 98765 00000",
      flat: "Tech Hub, Tower A, 4th Floor",
      area: "DLF Phase 3, Gurgaon",
      city: "Haryana",
      pincode: "122002",
      isDefault: false,
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "OD-482910",
      items: [
        { product: PRODUCTS[0], quantity: 2 },
        { product: PRODUCTS[7], quantity: 1 },
      ],
      subtotal: 335,
      discount: 0,
      deliveryFee: 0,
      total: 335,
      address: {
        id: "a1", name: "Ankit Kumar", phone: "+91 98765 43210",
        flat: "Penthouse C, Cloud Heights", area: "Sector 62, Noida",
        city: "Uttar Pradesh", pincode: "201301", isDefault: true,
      },
      paymentMethod: "UPI",
      date: "2026-05-20",
      status: "Delivered",
    },
    {
      id: "OD-519834",
      items: [
        { product: PRODUCTS[1], quantity: 1 },
        { product: PRODUCTS[3], quantity: 1 },
      ],
      subtotal: 560,
      discount: 112,
      deliveryFee: 0,
      total: 448,
      address: {
        id: "a1", name: "Ankit Kumar", phone: "+91 98765 43210",
        flat: "Penthouse C, Cloud Heights", area: "Sector 62, Noida",
        city: "Uttar Pradesh", pincode: "201301", isDefault: true,
      },
      paymentMethod: "Credit Card",
      date: "2026-05-15",
      status: "Delivered",
    },
    {
      id: "OD-537201",
      items: [
        { product: PRODUCTS[2], quantity: 1 },
      ],
      subtotal: 1999,
      discount: 0,
      deliveryFee: 0,
      total: 1999,
      address: {
        id: "a2", name: "Ankit Kumar (Office)", phone: "+91 98765 00000",
        flat: "Tech Hub, Tower A, 4th Floor", area: "DLF Phase 3, Gurgaon",
        city: "Haryana", pincode: "122002", isDefault: false,
      },
      paymentMethod: "COD",
      date: "2026-05-22",
      status: "Out for Delivery",
    },
  ]);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: "rx1",
      name: "Diabetes_Management_May2026.pdf",
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100",
      date: "2026-05-18",
      status: "Verified",
      extractedMedicines: ["Metformin Glycomet 500mg SR", "Paracetamol Crocin Advance 650mg"],
    },
    {
      id: "rx2",
      name: "Dermatology_Consultation_Apr2026.pdf",
      url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100",
      date: "2026-04-30",
      status: "Verified",
      extractedMedicines: ["Cetaphil Gentle Skin Cleanser"],
    },
    {
      id: "rx3",
      name: "Cardiology_Followup_May2026.pdf",
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100",
      date: "2026-05-22",
      status: "Processing (OCR)",
    },
  ]);

  // Push route using next/navigation router
  const setActivePage = (page: PageName, query?: string) => {
    const basePath = page === "home" ? "/" : `/${page}`;
    const targetPath = query ? `${basePath}?${query}` : basePath;
    router.push(targetPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const login = (email: string, name: string = "Valued Customer") => {
    setUser({
      name,
      email,
      phone: "+91 99999 88888",
    });
    setActivePage("home");
  };

  const logout = () => {
    setUser(null);
    setActivePage("home");
  };

  const signup = (name: string, email: string, phone: string) => {
    setUser({ name, email, phone });
    setActivePage("home");
  };

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

  const placeOrder = (addressId: string, paymentMethod: string, prescriptionUrl?: string) => {
    const address = addresses.find((a) => a.id === addressId) || addresses[0];
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

  const uploadPrescription = (name: string, url: string) => {
    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      name,
      url,
      date: new Date().toISOString().split("T")[0],
      status: "Processing (OCR)",
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    // Simulate clinical OCR extraction after 3 seconds
    setTimeout(() => {
      setPrescriptions((prevList) =>
        prevList.map((item) => {
          if (item.id === newRx.id) {
            return {
              ...item,
              status: "Verified",
              extractedMedicines: ["Metformin Glycomet 500mg SR", "Atorvastatin Lipivas 10mg"],
            };
          }
          return item;
        })
      );
    }, 4000);
  };



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
