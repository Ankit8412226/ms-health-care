"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddedToCartModal from "@/components/ui/AddedToCartModal";

export default function ConditionalConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // Return pure children for admin routes, preventing header/footer leak
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 font-sans transition-colors duration-300">
      <Header />
      <main className="flex-grow pb-16 md:pb-8">
        {children}
      </main>
      <Footer />
      <AddedToCartModal />
    </div>
  );
}
