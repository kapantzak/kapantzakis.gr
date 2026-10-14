"use client";

import { useEffect } from "react";
import { regionOf } from "@/lib/nav";

// Within one document the home page mounts again only after a link from the 404 page, where the region's inline
// script never runs (decision 182).
export function RegionScroll() {
  // An effect, not a layout effect, so it runs after Next.js's own scroll for the navigation (section 26).
  useEffect(() => {
    if (window.__regionPlaced) return;
    const region = regionOf(window.location.pathname);
    if (region) {
      document.getElementById(region)?.scrollIntoView({ behavior: "instant" });
    }
  }, []);
  return null;
}
