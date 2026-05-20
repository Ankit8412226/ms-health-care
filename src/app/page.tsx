"use client";
import { useApp } from "@/context/AppContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/components/pages/HomePage";
import ShopPage from "@/components/pages/ShopPage";
import DetailPage from "@/components/pages/DetailPage";
import CartPage from "@/components/pages/CartPage";
import CheckoutPage from "@/components/pages/CheckoutPage";
import SuccessPage from "@/components/pages/SuccessPage";
import DashboardPage from "@/components/pages/DashboardPage";
import UploadPage from "@/components/pages/UploadPage";
import AuthPage from "@/components/pages/AuthPage";
import StaticPages from "@/components/pages/StaticPages";

export default function MainApp() {
  const { activePage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Header />

      <main className="flex-grow pb-16 md:pb-8">
        {activePage === "home" && <HomePage />}
        {activePage === "shop" && <ShopPage />}
        {activePage === "details" && <DetailPage />}
        {activePage === "cart" && <CartPage />}
        {activePage === "checkout" && <CheckoutPage />}
        {activePage === "success" && <SuccessPage />}
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "upload" && <UploadPage />}
        {activePage === "auth" && <AuthPage />}

        {["about", "contact", "faq", "privacy"].includes(activePage) && (
          <StaticPages />
        )}
      </main>

      <Footer />
    </div>
  );
}
