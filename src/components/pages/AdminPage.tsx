"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Order, Prescription } from "@/context/AppContext";
import { Product } from "@/types";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Pill,
  LogOut,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Edit2,
  Trash2,
  Plus,
  DollarSign,
  Package,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  FileCheck,
  MapPin,
  Truck,
  Info,
  Tag,
  ListPlus,
  Compass,
  Link as LinkIcon,
  Loader2,
  Navigation,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

type AdminTab = "overview" | "orders" | "prescriptions" | "inventory" | "categories" | "customers";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Dashboard Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Local/UI Interactivity Modals
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Delivery Tracking Rider assignments (local mock store to feel extremely interactive)
  const [riderDetails, setRiderDetails] = useState<{ [orderId: string]: { name: string; phone: string } }>({
    "OD-482910": { name: "Ramesh Sharma", phone: "+91 98765 01010" },
    "OD-519834": { name: "Vikas Kumar", phone: "+91 88776 55443" },
    "OD-537201": { name: "Amit Singh", phone: "+91 90123 45678" }
  });

  // Shiprocket shipping state
  const [srLoading, setSrLoading] = useState<string | null>(null); // orderId that is being shipped
  const [srError, setSrError] = useState<string | null>(null);
  const [srSuccess, setSrSuccess] = useState<string | null>(null);
  
  const [tempRiderName, setTempRiderName] = useState("");
  const [tempRiderPhone, setTempRiderPhone] = useState("");

  // Pagination State
  const [productPage, setProductPage] = useState<number>(1);
  const [orderPage, setOrderPage] = useState<number>(1);
  const [prescriptionPage, setPrescriptionPage] = useState<number>(1);
  const [customerPage, setCustomerPage] = useState<number>(1);
  const itemsPerPage = 10;

  // App Context Data & Updates
  const {
    user,
    adminLogin,
    products,
    orders,
    prescriptions,
    categories,
    updateOrderStatus,
    updatePrescriptionStatus,
    updateProductPrice,
    deleteProduct,
    addProduct,
    addCategory,
    trackOrder,
  } = useApp();

  useEffect(() => {
    if (user && user.role === "admin") {
      setTimeout(() => setIsAuthenticated(true), 0);
    }
  }, [user]);

  // Product Creation Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdSlug, setNewProdSlug] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("prescription");
  const [newProdDosage, setNewProdDosage] = useState("");
  const [newProdPack, setNewProdPack] = useState("10 Tablets in 1 Strip");
  const [newProdMfg, setNewProdMfg] = useState("Cipla Pharmaceuticals");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdRxReq, setNewProdRxReq] = useState(false);
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdSalt, setNewProdSalt] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdShortDesc, setNewProdShortDesc] = useState("");
  const [newProdSideEffects, setNewProdSideEffects] = useState("");
  const [newProdStorage, setNewProdStorage] = useState("Store below 25°C. Protect from light and moisture.");

  // Success message toast simulation
  const [toastMessage, setToastMessage] = useState<string>("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Handle Admin Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Attempt real backend authentication first
    const success = await adminLogin(email, password);
    if (success) {
      setIsAuthenticated(true);
      triggerToast("Welcome back, Chief Administrator!");
    } else {
      setLoginError("Invalid administrator credentials. Please check and try again.");
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@oncolifeindia.com");
    setPassword("admin123");
    setLoginError("");
  };

  // Calculate Overview Stats
  const stats = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status !== "Delivered").length;
    
    const pendingPrescriptions = prescriptions.filter(
      (p) => p.status === "Processing (OCR)"
    ).length;

    const catalogSize = products.length;

    return {
      totalSales,
      pendingOrders,
      pendingPrescriptions,
      catalogSize,
    };
  }, [orders, prescriptions, products]);

  // Filters for Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, searchTerm, statusFilter]);

  // Filters for Prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const matchesSearch =
        rx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rx.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        statusFilter === "all" || rx.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.salt && prod.salt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        prod.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        statusFilter === "all" || prod.category === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, statusFilter]);

  // Group orders by customer and calculate aggregates
  const customers = useMemo(() => {
    const customerMap: {
      [email: string]: {
        name: string;
        email: string;
        phone: string;
        totalOrders: number;
        totalSpent: number;
        orders: Order[];
      };
    } = {};

    orders.forEach((order) => {
      const email = order.user?.email || order.address.phone + "@mscare-placeholder.com";
      const name = order.user?.name || order.address.name || "Walk-in Customer";
      const phone = order.user?.phone || order.address.phone || "";

      if (!customerMap[email]) {
        customerMap[email] = {
          name,
          email: order.user?.email ? order.user.email : "N/A (Guest Order)",
          phone,
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
        };
      }

      customerMap[email].totalOrders += 1;
      customerMap[email].totalSpent += order.total;
      customerMap[email].orders.push(order);
    });

    return Object.values(customerMap);
  }, [orders]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      return (
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [customers, searchTerm]);

  // Helper handlers to reset page states when user searches or filters
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setProductPage(1);
    setOrderPage(1);
    setPrescriptionPage(1);
    setCustomerPage(1);
  };

  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setProductPage(1);
    setOrderPage(1);
    setPrescriptionPage(1);
    setCustomerPage(1);
  };

  // Paginated Products
  const productMaxPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  }, [filteredProducts]);
  const activeProductPage = Math.min(productPage, productMaxPages);
  const paginatedProducts = useMemo(() => {
    const startIndex = (activeProductPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, activeProductPage]);

  // Paginated Orders
  const orderMaxPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  }, [filteredOrders]);
  const activeOrderPage = Math.min(orderPage, orderMaxPages);
  const paginatedOrders = useMemo(() => {
    const startIndex = (activeOrderPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, activeOrderPage]);

  // Paginated Prescriptions
  const prescriptionMaxPages = useMemo(() => {
    return Math.ceil(filteredPrescriptions.length / itemsPerPage) || 1;
  }, [filteredPrescriptions]);
  const activePrescriptionPage = Math.min(prescriptionPage, prescriptionMaxPages);
  const paginatedPrescriptions = useMemo(() => {
    const startIndex = (activePrescriptionPage - 1) * itemsPerPage;
    return filteredPrescriptions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPrescriptions, activePrescriptionPage]);

  // Paginated Customers
  const customerMaxPages = useMemo(() => {
    return Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  }, [filteredCustomers]);
  const activeCustomerPage = Math.min(customerPage, customerMaxPages);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (activeCustomerPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, activeCustomerPage]);

  // Reusable Pagination Component / HUD
  const renderPagination = (
    currentPage: number,
    maxPages: number,
    totalItems: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalItems <= itemsPerPage) return null;

    const startRange = (currentPage - 1) * itemsPerPage + 1;
    const endRange = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3.5 sm:px-6 rounded-b-2xl shadow-xs">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(currentPage + 1, maxPages))}
            disabled={currentPage === maxPages}
            className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-550 font-semibold">
              Showing <span className="font-bold text-slate-800">{startRange}</span> to{" "}
              <span className="font-bold text-slate-800">{endRange}</span> of{" "}
              <span className="font-bold text-slate-800">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-xl gap-1" aria-label="Pagination">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: maxPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === maxPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && (
                        <span className="relative inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-500">
                          ...
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                          currentPage === p
                            ? "z-10 bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => onPageChange(Math.min(currentPage + 1, maxPages))}
                disabled={currentPage === maxPages}
                className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Handle Edit Price inline
  const startEditPrice = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditingPrice(prod.price.toString());
  };

  const saveEditPrice = (prodId: string) => {
    const numPrice = parseFloat(editingPrice);
    if (!isNaN(numPrice) && numPrice > 0) {
      updateProductPrice(prodId, numPrice);
      setEditingProductId(null);
      triggerToast(`Product price updated to ₹${numPrice}`);
    } else {
      triggerToast("Please enter a valid price.");
    }
  };

  // Handle Dynamic Category Creation
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      triggerToast("Category name cannot be empty.");
      return;
    }
    const cleanName = newCategoryName.trim();
    // Check if category already exists
    const exists = categories.some(cat => cat.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      triggerToast("This category already exists.");
      return;
    }
    addCategory(cleanName);
    setNewCategoryName("");
    triggerToast(`Category "${cleanName}" created successfully!`);
  };

  // Handle Expanded Product Launch Submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProdPrice);
    if (!newProdName || isNaN(priceNum) || priceNum <= 0) {
      triggerToast("Please fill brand name and a valid price.");
      return;
    }

    const sideEffectsArr = newProdSideEffects
      ? newProdSideEffects.split(",").map(s => s.trim()).filter(Boolean)
      : ["Mild nausea", "Headache"];

    const defaultImage = "/default-product.png";
    const finalImage = newProdImage.trim() || defaultImage;
    const finalSlug = newProdSlug.trim() || newProdName.toLowerCase().replace(/\s+/g, "-");
    const finalBrand = newProdBrand.trim() || newProdMfg;

    const newProduct: Product = {
      id: `p_${Date.now()}`,
      name: newProdName,
      slug: finalSlug,
      description: newProdDesc.trim() || `Clinical immunosuppressant formulation for ${newProdCategory} indications.`,
      shortDescription: newProdShortDesc.trim() || newProdDesc.trim().slice(0, 120),
      price: priceNum,
      regularPrice: Math.round(priceNum * 1.25),
      onSale: true,
      rating: 0,
      reviewCount: 0,
      category: newProdCategory,
      categoryName: categories.find(c => c.id === newProdCategory)?.name || newProdCategory,
      brand: finalBrand,
      images: [{ id: Date.now(), src: finalImage, alt: newProdName, thumbnail: finalImage }],
      image: finalImage,
      manufacturer: newProdMfg || "Cipla Pharmaceuticals",
      prescriptionRequired: newProdRxReq,
      dosage: newProdDosage.trim() || undefined,
      packSize: newProdPack || "10 Tablets in 1 Strip",
      storage: newProdStorage || "Store below 25°C. Protect from light and moisture.",
      howToUse: "Take as prescribed by your doctor.",
      sideEffects: sideEffectsArr,
      benefits: `Effective clinical formulation for ${newProdCategory} indications.`,
      salt: newProdSalt.trim() || undefined,
    };

    addProduct(newProduct);
    setShowAddProductModal(false);
    
    setNewProdName("");
    setNewProdSlug("");
    setNewProdPrice("");
    setNewProdCategory("prescription");
    setNewProdDosage("");
    setNewProdPack("10 Tablets in 1 Strip");
    setNewProdMfg("Cipla Pharmaceuticals");
    setNewProdBrand("");
    setNewProdRxReq(false);
    setNewProdImage("");
    setNewProdSalt("");
    setNewProdDesc("");
    setNewProdShortDesc("");
    setNewProdSideEffects("");
    setNewProdStorage("Store below 25°C. Protect from light and moisture.");
    
    triggerToast(`Added ${newProdName} to catalog successfully!`);
  };

  // Open Order details and tracking
  const openOrderViewer = (order: Order) => {
    setSelectedOrder(order);
    setSrError(null);
    setSrSuccess(null);
    const existingRider = riderDetails[order.id] || { name: "", phone: "" };
    setTempRiderName(existingRider.name);
    setTempRiderPhone(existingRider.phone);
  };

  // Create Shiprocket Shipment handler
  const handleCreateShipment = async (order: Order) => {
    if (!user?.token) return;
    setSrLoading(order.id);
    setSrError(null);
    setSrSuccess(null);
    try {
      // Use the MongoDB _id from context — we'll pass orderId and let backend find it
      // But we need the actual _id for the route. We'll call track to get it, or use orderId route.
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/shiprocket/create/${order.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const json = await res.json();
      if (json.success) {
        setSrSuccess(`✅ Shipment created! AWB: ${json.data.awbCode || "Pending assignment"}`);
        // Update local order with AWB data
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder({
            ...selectedOrder,
            awbCode: json.data.awbCode,
            courierName: json.data.courierName,
            trackingUrl: json.data.trackingUrl,
            status: "Processing",
          });
        }
        // Also refresh tracking to sync context
        await trackOrder(order.id);
      } else {
        setSrError(json.message || "Shipment creation failed. Check your Shiprocket account.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setSrError(`Network error: ${errMsg}`);
    } finally {
      setSrLoading(null);
    }
  };

  // Save assigned delivery tracking rider
  const handleAssignRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRiderDetails(prev => ({
      ...prev,
      [selectedOrder.id]: { name: tempRiderName, phone: tempRiderPhone }
    }));
    triggerToast(`Rider "${tempRiderName}" assigned to order ${selectedOrder.id}`);
  };

  // Render Premium White Theme Login Card
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-800 transition-colors duration-300">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 animate-scale-in">
          {/* Logo header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 border border-white">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Onco Life India Admin Portal</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-1 text-center uppercase tracking-widest">
              Protected Administrative Interface
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 flex items-start gap-2.5 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oncolifeindia.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/15 mt-2 cursor-pointer"
            >
              Secure Sign In
            </button>
          </form>

          {/* Quick credential fill helper */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:text-emerald-700 transition-colors uppercase tracking-wider cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Quick Fill Demo Credentials
            </button>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Demo login is preconfigured with database admin credentials (admin@oncolifeindia.com / admin123).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Premium Light Mode Admin Dashboard
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-700 font-sans transition-colors duration-300">
      {/* Dynamic Success Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 border border-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl shadow-emerald-950/20 z-[999] flex items-center gap-2 animate-scale-in text-sm font-semibold">
          <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
          {toastMessage}
        </div>
      )}

      {/* ── SIDEBAR (Light Soft Slate Style) ─────────────────────────────── */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 shadow-sm shadow-slate-100">
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow shadow-emerald-500/20">
            <span className="text-white font-black text-xs">OL</span>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 leading-none">Onco Life India</div>
            <div className="text-[9px] text-emerald-600 font-extrabold tracking-widest leading-none mt-1 uppercase">
              Admin System
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Manage Orders", icon: ShoppingCart },
            { id: "prescriptions", label: "Clinical Review", icon: FileText },
            { id: "inventory", label: "Product Inventory", icon: Pill },
            { id: "categories", label: "Category Manager", icon: Tag },
            { id: "customers", label: "Customer List", icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as AdminTab);
                setSearchTerm("");
                setStatusFilter("all");
                setProductPage(1);
                setOrderPage(1);
                setPrescriptionPage(1);
                setCustomerPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setIsAuthenticated(false);
              triggerToast("Logged out successfully.");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-red-50 hover:text-red-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black tracking-wider text-slate-800 uppercase">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "orders" && "Orders Management"}
              {activeTab === "prescriptions" && "Clinical Rx Review"}
              {activeTab === "inventory" && "Catalog & Inventory"}
              {activeTab === "categories" && "Category Manager"}
              {activeTab === "customers" && "Customer Database & History"}
            </h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100 rounded-full">
              LIVE SYSTEM STATE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-500">System Connected</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center text-xs font-extrabold shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* ── [TAB] OVERVIEW ────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Total Sales",
                    value: `₹${stats.totalSales.toLocaleString()}`,
                    desc: "Revenue from Delivered orders",
                    icon: DollarSign,
                    gradient: "bg-emerald-500 text-white shadow-emerald-500/10",
                  },
                  {
                    label: "Active Orders",
                    value: stats.pendingOrders,
                    desc: "Orders awaiting delivery",
                    icon: ShoppingCart,
                    gradient: "bg-cyan-500 text-white shadow-cyan-500/10",
                  },
                  {
                    label: "Rx Awaiting Review",
                    value: stats.pendingPrescriptions,
                    desc: "Pending clinical OCR validation",
                    icon: FileText,
                    gradient: "bg-amber-500 text-white shadow-amber-500/10",
                  },
                  {
                    label: "Catalog Size",
                    value: stats.catalogSize,
                    desc: "Active medicinal formulations",
                    icon: Package,
                    gradient: "bg-purple-500 text-white shadow-purple-500/10",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 flex items-center gap-4 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <h3 className="text-2xl font-black text-slate-800 mt-0.5 group-hover:scale-102 transition-transform origin-left">{stat.value}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-none">{stat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Quick Actions */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm shadow-slate-100">
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-emerald-500" /> Admin Quick Tools
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setStatusFilter("Placed");
                        setOrderPage(1);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10 rounded-xl transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-850 group-hover:text-emerald-700 transition-colors">Pending Orders</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Audit new consumer orders</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 transition-all" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("prescriptions");
                        setStatusFilter("Processing (OCR)");
                        setPrescriptionPage(1);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10 rounded-xl transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-850 group-hover:text-emerald-700 transition-colors">Verify OCR Prescriptions</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">Review critical medical scans</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 transition-all" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("inventory");
                        setShowAddProductModal(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100/30 rounded-xl transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-emerald-700">Launch New Medicine</p>
                        <p className="text-[10px] text-emerald-600/80 mt-1 font-semibold">Add formulated stock with full specs</p>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-600 group-hover:rotate-90 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Right Column: System Logs */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm shadow-slate-100">
                  <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Layers className="w-4.5 h-4.5 text-emerald-500" /> Operational System Logs
                  </h3>
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {[
                      { time: "Just Now", type: "CRON", text: "OCR Pipeline successfully verified diabetes slip for Patient rx3.", status: "success" },
                      { time: "5 Mins Ago", type: "ORDER", text: "Order OD-537201 dispatched via express delivery executive.", status: "info" },
                      { time: "2 Hours Ago", type: "CATALOG", text: "Admin corrected inventory pricing details on Metformin Glycomet.", status: "success" },
                      { time: "5 Hours Ago", type: "AUTH", text: "Secure login session established for admin account.", status: "success" },
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs p-3 bg-slate-50 border border-slate-150 rounded-xl gap-4">
                        <div className="flex items-start gap-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                            log.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-cyan-100 text-cyan-800"
                          }`}>
                            {log.type}
                          </span>
                          <span className="text-slate-700 font-semibold">{log.text}</span>
                        </div>
                        <span className="text-slate-400 font-bold whitespace-nowrap shrink-0">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── [TAB] ORDERS ──────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-100 overflow-hidden space-y-6 p-6 animate-fade-in">
              {/* Header and Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Purchase Orders Database</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Audit, track deliveries, and dispatch customer medicine orders</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ID, Customer..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold w-52 placeholder:text-slate-400 text-slate-750"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Placed">Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 pl-4">Order ID</th>
                      <th className="py-3">Customer Info</th>
                      <th className="py-3">Placement Date</th>
                      <th className="py-3 text-right">Items Count</th>
                      <th className="py-3 text-right">Total Amount</th>
                      <th className="py-3 text-center">Payment</th>
                      <th className="py-3 text-center">Status Badge</th>
                      <th className="py-3 text-center pr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-450 font-semibold">
                          No orders matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/40 group transition-colors">
                          <td className="py-4 pl-4">
                            <button
                              onClick={() => openOrderViewer(order)}
                              className="font-mono font-bold text-emerald-600 hover:text-emerald-700 text-left cursor-pointer flex items-center gap-1 group/btn"
                            >
                              {order.id}
                              <Eye className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            </button>
                          </td>
                          <td className="py-4">
                            <p className="font-bold text-slate-800">{order.address.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{order.address.phone}</p>
                          </td>
                          <td className="py-4 font-semibold text-slate-650">{order.date}</td>
                          <td className="py-4 text-right font-bold text-slate-500">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </td>
                          <td className="py-4 text-right font-black text-slate-800">₹{order.total}</td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-500">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                              order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              order.status === "Out for Delivery" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              order.status === "Processing" ? "bg-blue-50 text-cyan-700 border-cyan-200" :
                              "bg-amber-50 text-orange-700 border-orange-200"
                            }`}>
                              {order.status}
                            </span>
                            {order.items.some(item => item.product.prescriptionRequired) && !order.prescriptionUrl && (
                              <span className="mt-1 block text-[9px] font-extrabold text-red-650 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 max-w-[80px] mx-auto uppercase tracking-wide">
                                Rx Missing
                              </span>
                            )}
                            {order.prescriptionUrl && (
                              <a
                                href={order.prescriptionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 flex items-center justify-center gap-0.5 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-250 rounded px-1.5 py-0.5 max-w-[80px] mx-auto uppercase tracking-wide hover:bg-emerald-100 transition-colors"
                              >
                                <FileText className="w-2.5 h-2.5" /> Rx View
                              </a>
                            )}
                          </td>
                          <td className="py-4 text-center pr-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openOrderViewer(order)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 cursor-pointer"
                              >
                                View &amp; Track
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  updateOrderStatus(order.id, e.target.value as Order["status"]);
                                  triggerToast(`Order ${order.id} status changed to ${e.target.value}`);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-650 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                              >
                                <option value="Placed">Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(orderPage, orderMaxPages, filteredOrders.length, setOrderPage)}
            </div>
          )}

          {/* ── [TAB] PRESCRIPTIONS ────────────────────────────────────────── */}
          {activeTab === "prescriptions" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-100 overflow-hidden space-y-6 p-6 animate-fade-in">
              {/* Header and Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Prescriptions Clinical Audit</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Review medical uploads and verify clinical validity</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Patient, Medicines..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold w-52 placeholder:text-slate-400 text-slate-750"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Processing (OCR)">Processing (OCR)</option>
                      <option value="Verified">Verified</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 pl-4">Rx ID</th>
                      <th className="py-3">Clinical PDF File Name</th>
                      <th className="py-3">Upload Date</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-center pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPrescriptions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-450 font-semibold">
                          No prescriptions matching criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedPrescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-slate-50/40 group transition-colors">
                          <td className="py-4 pl-4 font-mono font-bold text-emerald-600">{rx.id}</td>
                          <td className="py-4 font-semibold text-slate-800">{rx.name}</td>
                          <td className="py-4 font-semibold text-slate-650">{rx.date}</td>
                          <td className="py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                              rx.status === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              rx.status === "Rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-amber-50 text-orange-700 border-orange-200 animate-pulse"
                            }`}>
                              {rx.status}
                            </span>
                          </td>
                          <td className="py-4 text-center pr-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedPrescription(rx)}
                                className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-slate-400 transition-all cursor-pointer"
                                title="Open clinical viewer scan"
                              >
                                <Eye className="w-4.5 h-4.5" />
                              </button>

                              {rx.status === "Processing (OCR)" && (
                                <>
                                  <button
                                    onClick={() => {
                                      updatePrescriptionStatus(rx.id, "Verified");
                                      triggerToast(`Prescription ${rx.id} approved by clinician.`);
                                    }}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg transition-all cursor-pointer"
                                    title="Approve prescription"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      updatePrescriptionStatus(rx.id, "Rejected");
                                      triggerToast(`Prescription ${rx.id} rejected.`);
                                    }}
                                    className="p-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 rounded-lg transition-all cursor-pointer"
                                    title="Reject prescription"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(prescriptionPage, prescriptionMaxPages, filteredPrescriptions.length, setPrescriptionPage)}
            </div>
          )}

          {/* ── [TAB] INVENTORY ────────────────────────────────────────────── */}
          {activeTab === "inventory" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-100 overflow-hidden space-y-6 p-6 animate-fade-in">
              {/* Header and Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Catalog &amp; Inventory Management</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Synchronize pricing, medical specifications, and launch formulations</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search brand, salt, manufacturer..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold w-52 placeholder:text-slate-400 text-slate-750"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="bg-transparent text-xs text-slate-650 font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Launch Product button */}
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Launch Formulation
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 pl-4">Product Formulation Info</th>
                      <th className="py-3">Category</th>
                      <th className="py-3">Form &amp; Pack Size</th>
                      <th className="py-3">Manufacturer</th>
                      <th className="py-3 text-center">Rx Required</th>
                      <th className="py-3 text-right w-36">Pricing (₹)</th>
                      <th className="py-3 text-center pr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-450 font-semibold">
                          No products match search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/40 group transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-250 bg-slate-100 shrink-0 relative">
                                <Image
                                  src={prod.image}
                                  alt={prod.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate max-w-xs">{prod.name}</p>
                                {prod.salt && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 font-semibold">
                                    {prod.salt}{prod.dosage ? ` · ${prod.dosage}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 capitalize">
                              {prod.category}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-slate-700">
                            {prod.dosage || "—"}
                            <span className="block text-[10px] text-slate-400 mt-0.5 font-bold">{prod.packSize}</span>
                          </td>
                          <td className="py-4 font-bold text-slate-500">{prod.manufacturer}</td>
                          <td className="py-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block border ${
                              prod.prescriptionRequired
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-slate-100 text-slate-400 border-transparent"
                            }`}>
                              {prod.prescriptionRequired ? "Rx Required" : "No Rx"}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            {editingProductId === prod.id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-slate-400 font-bold">₹</span>
                                <input
                                  type="text"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  className="w-16 bg-white border border-slate-350 text-right rounded px-1.5 py-1 text-xs font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEditPrice(prod.id)}
                                  className="p-1 hover:bg-emerald-600 rounded bg-emerald-50 text-emerald-600 hover:text-white transition-all border border-emerald-200 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingProductId(null)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2 group/price">
                                <span className="font-black text-slate-850">₹{prod.price}</span>
                                <button
                                  onClick={() => startEditPrice(prod)}
                                  className="opacity-0 group-hover/price:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-slate-800 cursor-pointer"
                                  title="Edit price inline"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 text-center pr-4">
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${prod.name} from catalog?`)) {
                                  deleteProduct(prod.id);
                                  triggerToast(`Deleted ${prod.name} from product catalog.`);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-all cursor-pointer"
                              title="Delete from inventory catalog"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(productPage, productMaxPages, filteredProducts.length, setProductPage)}
            </div>
          )}

          {/* ── [TAB] CATEGORIES (Category Manager Tab) ────────────────────── */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left Column: Create Category Form */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm shadow-slate-100 h-fit">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                  <ListPlus className="w-4.5 h-4.5 text-emerald-500" /> Create Category
                </h3>
                
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      New Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Heart Care, Baby Care"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Build Category
                  </button>
                </form>
              </div>

              {/* Right Column: Categories Database */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm shadow-slate-100">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Tag className="w-4.5 h-4.5 text-emerald-500" /> Active System Categories
                  </h3>
                  <p className="text-[11px] text-slate-450 mt-1 font-semibold">Categories currently supporting storefront search tags and filter sidebars</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                        <th className="pb-3 pl-2">Category ID</th>
                        <th className="pb-3">Category Name</th>
                        <th className="pb-3">Dynamic Icon Tag</th>
                        <th className="pb-3 text-right pr-2">Linked Formulations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 pl-2 font-mono font-bold text-slate-500">{cat.id}</td>
                          <td className="py-3.5 font-bold text-slate-800 capitalize">{cat.name}</td>
                          <td className="py-3.5 font-semibold text-slate-450">{cat.icon}</td>
                          <td className="py-3.5 text-right font-black text-emerald-700 pr-2">
                            {products.filter((p) => p.category === cat.id).length} items
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── [TAB] CUSTOMERS (Customer List Tab) ────────────────────── */}
          {activeTab === "customers" && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-100 overflow-hidden space-y-6 p-6 animate-fade-in">
              {/* Header and Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Customer Database</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Audit registered customer contact details, activity metrics, and purchase histories</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search customer, phone, email..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold w-64 placeholder:text-slate-400 text-slate-750"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-3 pl-4">Customer Name</th>
                      <th className="py-3">Email Address</th>
                      <th className="py-3">Contact Phone</th>
                      <th className="py-3 text-center">Orders Placed</th>
                      <th className="py-3 text-right">Total Revenue Spent</th>
                      <th className="py-3 text-center pr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-450 font-semibold">
                          No customer profiles matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((cust, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 group transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0 shadow-sm">
                                {cust.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                              </div>
                              <span className="font-bold text-slate-800">{cust.name}</span>
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-slate-650">{cust.email}</td>
                          <td className="py-4 font-semibold text-slate-650">{cust.phone || "—"}</td>
                          <td className="py-4 text-center font-bold text-slate-500">
                            {cust.totalOrders} order{cust.totalOrders > 1 ? "s" : ""}
                          </td>
                          <td className="py-4 text-right font-black text-slate-850">
                            ₹{cust.totalSpent.toLocaleString()}
                          </td>
                          <td className="py-4 text-center pr-4">
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="px-3 py-1.5 hover:bg-emerald-600 hover:text-white text-emerald-700 bg-emerald-50 border border-emerald-250 hover:border-emerald-600 font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                            >
                              View Orders History
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {renderPagination(customerPage, customerMaxPages, filteredCustomers.length, setCustomerPage)}
            </div>
          )}

        </div>
      </main>

      {/* ── [MODAL] ORDER DETAIL VIEW & DELIVERY TRACKING HUD ────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative z-10 animate-scale-in text-slate-700 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Order Management &amp; Delivery Tracker</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  Order ID Reference: <span className="font-mono text-emerald-600 font-extrabold">{selectedOrder.id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-slate-250 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Items, Total & Address (7 spans) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer & Address Details */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-500" /> Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Patient Name</p>
                      <p className="text-slate-800 font-bold mt-0.5">{selectedOrder.address.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Contact Number</p>
                      <p className="text-slate-800 font-bold mt-0.5">{selectedOrder.address.phone}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase">Delivery Location Address</p>
                    <p className="text-slate-700 font-medium mt-0.5 text-xs">
                      {selectedOrder.address.flat}, {selectedOrder.address.area}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
                    </p>
                  </div>
                </div>

                {selectedOrder.items.some(item => item.product.prescriptionRequired) && !selectedOrder.prescriptionUrl && (
                  <div className="bg-red-50 border border-red-150 rounded-2xl p-4 flex gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    <div className="text-xs">
                      <strong className="text-red-900 block mb-0.5">⚠️ Delivery Alert: Prescription Missing</strong>
                      This order contains prescription-only items, but no prescription slip was uploaded by the customer. Delivery should not proceed until the prescription is uploaded.
                    </div>
                  </div>
                )}

                {selectedOrder.prescriptionUrl && (
                  <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex flex-col gap-3 text-slate-800">
                    <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <div>
                          <span className="text-xs font-bold text-slate-855 block">Uploaded Prescription Scan</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Status: <strong className="text-emerald-700 capitalize">{selectedOrder.prescriptionStatus || "Pending Review"}</strong>
                          </span>
                        </div>
                      </div>
                      <a
                        href={selectedOrder.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Full Image
                      </a>
                    </div>
                    <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                      <img
                        src={selectedOrder.prescriptionUrl}
                        alt="Uploaded Prescription"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Status update controls inside order details */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50">
                      <span className="text-[10px] font-bold text-slate-450">Prescription Action:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(selectedOrder.id, undefined, "Approved");
                              setSelectedOrder({ ...selectedOrder, prescriptionStatus: "Approved" });
                              triggerToast("Prescription status updated to Approved.");
                            } catch (err) {
                              triggerToast("Error updating prescription status.");
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Approve Rx
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatus(selectedOrder.id, undefined, "Rejected");
                              setSelectedOrder({ ...selectedOrder, prescriptionStatus: "Rejected" });
                              triggerToast("Prescription status updated to Rejected.");
                            } catch (err) {
                              triggerToast("Error updating prescription status.");
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordered Medicinal Formulations</h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-150">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-850 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {item.product.dosage || item.product.packSize} | Price: ₹{item.product.price}
                          </p>
                        </div>
                        <div className="text-right whitespace-nowrap shrink-0 pl-2">
                          <p className="text-xs font-bold text-slate-800">Qty: {item.quantity}</p>
                          <p className="text-[11px] font-black text-slate-800 mt-0.5">₹{item.product.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Cost Summary Breakdown */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Cart Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-red-600">
                      <span>Refill Discount Applied</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Express Delivery Fee</span>
                    <span>₹{selectedOrder.deliveryFee === 0 ? "FREE" : `₹${selectedOrder.deliveryFee}`}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Bill Recipient</span>
                    <span className="text-emerald-700">₹{selectedOrder.total}</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Delivery Tracking Timeline & Rider Assignment (5 spans) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Delivery Progress Bar & Tracking timeline */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-500" /> Live Delivery Tracker
                  </h4>

                  {/* Horizontal visual progress graphic */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                      <span>PHARMACY</span>
                      <span>IN TRANSIT</span>
                      <span>PATIENT</span>
                    </div>
                    {/* Visual line */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full relative">
                      <div className={`h-full bg-emerald-500 rounded-full transition-all duration-500 ${
                        selectedOrder.status === "Placed" ? "w-1/4" :
                        selectedOrder.status === "Processing" ? "w-1/2" :
                        selectedOrder.status === "Out for Delivery" ? "w-3/4" :
                        "w-full"
                      }`} />
                      {/* Interactive Rider Icon */}
                      <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-500" style={{
                        left: selectedOrder.status === "Placed" ? "20%" :
                              selectedOrder.status === "Processing" ? "45%" :
                              selectedOrder.status === "Out for Delivery" ? "70%" :
                              "93%"
                      }}>
                        <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow shadow-emerald-500/40 text-white">
                          <Truck className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Timeline Progress steps */}
                  <div className="relative pl-6 space-y-4 text-xs font-semibold">
                    <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-slate-200" />
                    
                    {[
                      { step: "Placed", label: "Order Registered & Placed", desc: "Received at central server" },
                      { step: "Processing", label: "Dispensing & Packing", desc: "CDSCO licensed pharmacist review" },
                      { step: "Out for Delivery", label: "Dispatched (Out for Delivery)", desc: "Express delivery partner assigned" },
                      { step: "Delivered", label: "Safe Handover (Delivered)", desc: "Delivered to patient's door" }
                    ].map((stepObj) => {
                      const isCompleted = ["Placed", "Processing", "Out for Delivery", "Delivered"].indexOf(selectedOrder.status) >= ["Placed", "Processing", "Out for Delivery", "Delivered"].indexOf(stepObj.step);
                      const isActive = selectedOrder.status === stepObj.step;
                      return (
                        <div key={stepObj.step} className="relative">
                          {/* Indicator circle */}
                          <div className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 ${
                            isActive ? "bg-emerald-600 border-white ring-2 ring-emerald-500/20" :
                            isCompleted ? "bg-emerald-500 border-white" :
                            "bg-white border-slate-300"
                          }`} />
                          <div className={isCompleted ? "text-slate-800" : "text-slate-400"}>
                            <p className="font-black text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                              {stepObj.label}
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{stepObj.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Delivery Rider details assign form */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-500" /> Assign Delivery Rider
                  </h4>
                  
                  <form onSubmit={handleAssignRider} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Rider Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ramesh Sharma"
                          value={tempRiderName}
                          onChange={(e) => setTempRiderName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +91 99999 88888"
                          value={tempRiderPhone}
                          onChange={(e) => setTempRiderPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-350 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-850 hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Record Rider Allocation
                    </button>
                  </form>

                  {/* Rider allocated display */}
                  {riderDetails[selectedOrder.id] && riderDetails[selectedOrder.id].name && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow shadow-emerald-500/10">
                        {riderDetails[selectedOrder.id].name.charAt(0)}
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="font-bold text-emerald-800">Assigned: {riderDetails[selectedOrder.id].name}</p>
                        <p className="text-[10px] text-emerald-600/80 font-bold mt-0.5">{riderDetails[selectedOrder.id].phone}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Footer Operations */}
            <div className="px-6 py-4 border-t border-slate-150 shrink-0 bg-slate-50/50 space-y-3">

              {/* Shiprocket AWB info */}
              {selectedOrder.awbCode && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-blue-700">{selectedOrder.courierName || "Courier"} • AWB: <span className="font-mono">{selectedOrder.awbCode}</span></p>
                  </div>
                  {selectedOrder.trackingUrl && (
                    <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline shrink-0">
                      <ExternalLink className="w-3 h-3" /> Track
                    </a>
                  )}
                </div>
              )}

              {/* Shiprocket errors/success */}
              {srError && srLoading === null && (
                <div className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{srError}</div>
              )}
              {srSuccess && (
                <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{srSuccess}</div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-450">
                  Status is live and immediately synced to client app dashboard.
                </span>
                <div className="flex items-center gap-2">
                  {/* Create Shiprocket Shipment */}
                  {!selectedOrder.awbCode && (
                    <button
                      onClick={() => handleCreateShipment(selectedOrder)}
                      disabled={srLoading === selectedOrder.id}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-[10px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {srLoading === selectedOrder.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                      ) : (
                        <><Truck className="w-3.5 h-3.5" /> Create Shipment</>)}
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedOrder(null); setSrError(null); setSrSuccess(null); }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── [MODAL] CLINICAL PRESCRIPTION SCAN Audit VIEW ────────────────── */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedPrescription(null)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 animate-scale-in text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-905 text-sm uppercase tracking-wider">Clinical Prescriptive Document Scan</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Rx ID Reference: <span className="font-mono text-emerald-600 font-extrabold">{selectedPrescription.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Document Image */}
              <div className="p-6 bg-slate-100 border-r border-slate-150 flex items-center justify-center min-h-[300px]">
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <Image
                    src={selectedPrescription.url}
                    alt={selectedPrescription.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Patient and Clinical details */}
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Patient Attachment</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedPrescription.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Uploaded On</span>
                    <p className="font-semibold text-slate-650 text-xs mt-0.5">{selectedPrescription.date}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-150">
                  {selectedPrescription.status === "Processing (OCR)" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          updatePrescriptionStatus(selectedPrescription.id, "Verified");
                          setSelectedPrescription(null);
                          triggerToast("Prescription clinical scan verified and approved.");
                        }}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow shadow-emerald-600/10 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" /> Approve Rx
                      </button>
                      <button
                        onClick={() => {
                          updatePrescriptionStatus(selectedPrescription.id, "Rejected");
                          setSelectedPrescription(null);
                          triggerToast("Prescription scan rejected.");
                        }}
                        className="py-2.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 active:scale-98 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Reject Rx
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-center">
                      <span className={`text-xs font-bold capitalize ${
                        selectedPrescription.status === "Verified" ? "text-emerald-700" : "text-red-700"
                      }`}>
                        Decision Recorded: {selectedPrescription.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── [MODAL] LAUNCH NEW PRODUCT (Expanded medical fields) ───────── */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddProductModal(false)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative z-10 animate-scale-in text-slate-800 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Launch New Product formulation</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Synthesize and release new clinical inventory stock</p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Brand Name */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Medicine Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol Dolo 650mg"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              {/* Salt Composition */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Salt / Medical Ingredient Composition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol IP 650mg, Caffeine 50mg"
                  value={newProdSalt}
                  onChange={(e) => setNewProdSalt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Clinical Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide therapeutic actions, benefits, and general indications of the medicine formulation..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category selector */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Catalog Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-700 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Form factor → Dosage */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Dosage Strength
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 360MG, 500MG, 10MG"
                    value={newProdDosage}
                    onChange={(e) => setNewProdDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Pricing */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                  />
                </div>

                {/* Pack Size */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Pack Size Unit
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Tablets in a strip"
                    value={newProdPack}
                    onChange={(e) => setNewProdPack(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Manufacturer */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Manufacturer Co.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Concord Biotech Ltd"
                    value={newProdMfg}
                    onChange={(e) => setNewProdMfg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CONCORD BIOTECH LIMITED"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Image Link / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://domain.com/tablet.jpg"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              {/* Side Effects list (comma separated) */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Side Effects (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nausea, Headache, Diarrhea"
                  value={newProdSideEffects}
                  onChange={(e) => setNewProdSideEffects(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              {/* Storage instructions */}
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Storage Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Store below 30°C. Protect from light."
                  value={newProdStorage}
                  onChange={(e) => setNewProdStorage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 placeholder:text-slate-350"
                />
              </div>

              {/* Prescription Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 select-none">
                <input
                  type="checkbox"
                  id="newProdRx"
                  checked={newProdRxReq}
                  onChange={(e) => setNewProdRxReq(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500/20 bg-white border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="newProdRx" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Requires Doctor&apos;s Prescription (Rx Badge)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-550 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/15 cursor-pointer"
                >
                  Synthesize Formulation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── [MODAL] CUSTOMER ORDER HISTORY DRILL-DOWN VIEW ────────────────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
          
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative z-10 animate-scale-in text-slate-700 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Customer Profile &amp; Purchase Log</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  Derived Customer Record: <span className="text-emerald-600 font-extrabold">{selectedCustomer.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-slate-250 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Overview Card */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-lg shadow-sm shrink-0">
                    {selectedCustomer.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{selectedCustomer.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedCustomer.email}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedCustomer.phone || "No Phone Number Provided"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-center shadow-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-center shadow-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Value Spent</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order History Timeline List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Customer Purchase Orders Log ({selectedCustomer.orders.length})</h4>
                
                {selectedCustomer.orders.map((order: Order) => (
                  <div key={order.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    {/* Order summary bar */}
                    <div className="bg-slate-50/70 border-b border-slate-150 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                          }}
                          className="font-mono text-emerald-600 hover:text-emerald-700 font-black text-left flex items-center gap-1 cursor-pointer"
                        >
                          {order.id}
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-450">{order.date}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">{order.paymentMethod}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border ${
                          order.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          order.status === "Out for Delivery" ? "bg-purple-50 text-purple-700 border-purple-200" :
                          order.status === "Processing" ? "bg-blue-50 text-cyan-700 border-cyan-200" :
                          "bg-amber-50 text-orange-700 border-orange-200"
                        }`}>
                          {order.status}
                        </span>
                        
                        {order.prescriptionUrl && (
                          <a
                            href={order.prescriptionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 border border-emerald-250 rounded transition-all flex items-center gap-0.5"
                          >
                            <FileText className="w-2.5 h-2.5" /> Rx Scan
                          </a>
                        )}
                        
                        <span className="text-slate-800 font-black pl-2">Total: ₹{order.total}</span>
                      </div>
                    </div>

                    {/* Order items nested list */}
                    <div className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 text-xs hover:bg-slate-50/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded border border-slate-150 overflow-hidden relative bg-slate-50 shrink-0">
                              <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-xs md:max-w-md">{item.product.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                                Brand: {item.product.brand || "Generics"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right whitespace-nowrap pl-4">
                            <span className="font-semibold text-slate-550 mr-4">Qty: {item.quantity}</span>
                            <span className="font-bold text-slate-850">₹{item.product.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
