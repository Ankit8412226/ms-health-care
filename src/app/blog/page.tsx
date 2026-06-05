"use client";

import React, { Suspense } from "react";
import BlogPage from "@/components/pages/BlogPage";
import { Loader2 } from "lucide-react";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <BlogPage />
    </Suspense>
  );
}
