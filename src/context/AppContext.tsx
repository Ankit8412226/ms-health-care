"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Doctor, LabTest, PRODUCTS } from "@/data/mockData";

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

export interface DoctorAppointment {
  id: string;
  doctor: Doctor;
  date: string;
  slot: string;
  type: "Chat" | "Video" | "Audio";
  patientName: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface LabAppointment {
  id: string;
  test: LabTest;
  date: string;
  slot: string;
  patientName: string;
  status: "Scheduled" | "Completed" | "Report Ready";
}

export type PageName =
  | "home"
  | "shop"
  | "details"
  | "cart"
  | "checkout"
  | "success"
  | "dashboard"
  | "doctors"
  | "labtests"
  | "auth"
  | "upload"
  | "about"
  | "contact"
  | "faq"
  | "privacy";

export type AuthMode = "login" | "signup" | "forgot" | "otp";

interface AppContextType {
  activePage: PageName;
  setActivePage: (page: PageName) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
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
  doctorAppointments: DoctorAppointment[];
  bookDoctor: (doctor: Doctor, date: string, slot: string, type: "Chat" | "Video" | "Audio", patient: string) => void;
  labAppointments: LabAppointment[];
  bookLabTest: (test: LabTest, date: string, slot: string, patient: string) => void;
  couponCode: string;
  discountPercentage: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePageState] = useState<PageName>("home");
  const [selectedProductId, setSelectedProductId] = useState<string>("p1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>({
    name: "Ankit Kumar",
    email: "ankit@mscare.com",
    phone: "+91 98765 43210",
  });
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [otpEmail, setOtpEmail] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

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

  const [orders, setOrders] = useState<Order[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: "rx1",
      name: "Dermatology_Consultation.pdf",
      url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=100",
      date: "2026-05-18",
      status: "Verified",
      extractedMedicines: ["Cetaphil Gentle Skin Cleanser"],
    },
  ]);

  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>([]);
  const [labAppointments, setLabAppointments] = useState<LabAppointment[]>([]);

  // Smooth scroll to top when changing views
  const setActivePage = (page: PageName) => {
    setActivePageState(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product: Product, qty: number = 1) => {
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
      id: `OD-${Math.floor(100000 + Math.random() * 900000)}`,
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

  const bookDoctor = (
    doctor: Doctor,
    date: string,
    slot: string,
    type: "Chat" | "Video" | "Audio",
    patient: string
  ) => {
    const newAppt: DoctorAppointment = {
      id: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
      doctor,
      date,
      slot,
      type,
      patientName: patient,
      status: "Scheduled",
    };
    setDoctorAppointments((prev) => [newAppt, ...prev]);
  };

  const bookLabTest = (test: LabTest, date: string, slot: string, patient: string) => {
    const newAppt: LabAppointment = {
      id: `LAB-${Math.floor(10000 + Math.random() * 90000)}`,
      test,
      date,
      slot,
      patientName: patient,
      status: "Scheduled",
    };
    setLabAppointments((prev) => [newAppt, ...prev]);
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
        doctorAppointments,
        bookDoctor,
        labAppointments,
        bookLabTest,
        couponCode,
        discountPercentage,
        applyCoupon,
        removeCoupon,
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
