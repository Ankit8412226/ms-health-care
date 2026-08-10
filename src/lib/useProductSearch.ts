"use client";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";

/**
 * Debounced server-side product search, shared by the header and hero search
 * boxes.
 *
 * Both used to filter the products array held in context. That only worked
 * because the app downloaded all 1,292 products (3.68 MB) on every page load
 * purely so these two boxes could do a substring match. Querying the API
 * instead makes search cover the whole catalogue while the browser holds a
 * single page of products.
 *
 * @param query    raw input value
 * @param limit    maximum results to show
 * @param minChars minimum characters before a request is made
 */
export function useProductSearch(query: string, limit = 6, minChars = 2) {
  const { searchProducts } = useApp();
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  // Identifies the newest request so a slow earlier response cannot overwrite
  // the results of a later, faster one.
  const requestRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < minChars) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const requestId = ++requestRef.current;

    // Wait for a pause in typing rather than firing a request per keystroke.
    const timer = setTimeout(async () => {
      const found = await searchProducts(trimmed, limit);
      if (requestId === requestRef.current) {
        setResults(found);
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, limit, minChars, searchProducts]);

  return { results, searching };
}
