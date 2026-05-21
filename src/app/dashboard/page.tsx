"use client";
import React, { Suspense } from "react";
import DashboardPage from "@/components/pages/DashboardPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>}>
      <DashboardPage />
    </Suspense>
  );
}
