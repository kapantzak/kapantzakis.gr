"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  NAV_ITEMS,
  REGIONS,
  type RegionId,
  isHomePath,
  regionOf,
  regionPath,
  sectionOf,
} from "@/lib/nav";
import styles from "./Nav.module.css";
import { SectionLink } from "./SectionLink";

// A region counts as current while it crosses a band around the middle of the viewport.
const BAND = "-45% 0px -50% 0px";

// `undefined` while no report counts: until a region has been current, so a hash the page was opened with survives
// the first report, and, when tracking starts on a section path, until the first scroll (decision 184).
function useRegionInView(enabled: boolean): RegionId | null | undefined {
  const [current, setCurrent] = useState<RegionId | null>();
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const inBand = new Set<RegionId>();
    let latest: RegionId | null = null;
    let holding = regionOf(window.location.pathname) !== null;
    const report = () =>
      setCurrent((value) =>
        value === undefined && latest === null ? undefined : latest,
      );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as RegionId;
          if (entry.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        }
        // A group inside Experience comes after it in REGIONS, so it wins (decision 174).
        latest = REGIONS.findLast((id) => inBand.has(id)) ?? null;
        if (!holding) report();
      },
      { rootMargin: BAND },
    );
    for (const id of REGIONS) {
      const region = document.getElementById(id);
      if (region) observer.observe(region);
    }
    // The first scroll ends the hold; from there an empty band means `/`, even before any region has counted.
    const release = () => {
      holding = false;
      setCurrent(latest);
    };
    // The jump that placed the region scrolls before the next frame; the visitor's own scroll comes after it.
    const frame = holding
      ? requestAnimationFrame(() =>
          window.addEventListener("scroll", release, { once: true }),
        )
      : 0;
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", release);
      // Returning home must not resurrect the region that was current before leaving.
      setCurrent(undefined);
    };
  }, [enabled]);
  return enabled ? current : undefined;
}

// Replaced, not pushed, so scrolling never adds Back steps (decision 174).
function usePathFollows(current: RegionId | null | undefined): void {
  useEffect(() => {
    if (current === undefined) return;
    const path = current ? regionPath(current) : "/";
    if (window.location.pathname === path && !window.location.hash) return;
    // A plain state object, so Next.js syncs usePathname (section 26).
    history.replaceState({}, "", path + window.location.search);
  }, [current]);
}

export function NavLinks() {
  const pathname = usePathname();
  const current = useRegionInView(isHomePath(pathname));
  usePathFollows(current);
  // Until a report counts, the path the page arrived on says which item is current (decision 184).
  const region = current === undefined ? regionOf(pathname) : current;
  const section = region ? sectionOf(region) : null;
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <SectionLink
            id={item.id}
            className={styles.link}
            aria-current={section === item.id ? "true" : undefined}
          >
            {item.label}
          </SectionLink>
        </li>
      ))}
    </ul>
  );
}
