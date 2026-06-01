"use client";
import React, { Suspense } from "react";
import ShopPage from "@/components/pages/ShopPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Shop...</div>}>
      <ShopPage />
    </Suspense>
  );
}
