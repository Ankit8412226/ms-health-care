"use client";
import { Suspense } from "react";
import DetailPage from "@/components/pages/DetailPage";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DetailPage />
    </Suspense>
  );
}
