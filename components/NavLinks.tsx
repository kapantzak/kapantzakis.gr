"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, sectionHref, type SectionId } from "@/lib/nav";
import styles from "./Nav.module.css";

// A section counts as current while it crosses a band around the middle of the viewport.
const BAND = "-45% 0px -50% 0px";

// `undefined` until a section has been current, so the hash a page was opened with survives the first report.
function useSectionInView(enabled: boolean): SectionId | null | undefined {
  const [current, setCurrent] = useState<SectionId | null>();
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) setCurrent(id);
          else setCurrent((value) => (value === id ? null : value));
        }
      },
      { rootMargin: BAND },
    );
    for (const { id } of NAV_ITEMS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => {
      observer.disconnect();
      // Returning home must not resurrect the section that was current before leaving.
      setCurrent(undefined);
    };
  }, [enabled]);
  return enabled ? current : undefined;
}

// Replaced, not pushed, so scrolling never adds Back steps (decisions 124–125).
function useHashFollows(current: SectionId | null | undefined): void {
  useEffect(() => {
    if (current === undefined) return;
    const hash = current ? `#${current}` : "";
    if (window.location.hash === hash) return;
    // Keep the router's state object so Next.js still recognises the entry.
    history.replaceState(
      history.state,
      "",
      window.location.pathname + window.location.search + hash,
    );
  }, [current]);
}

export function NavLinks() {
  const current = useSectionInView(usePathname() === "/");
  useHashFollows(current);
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <Link
            href={sectionHref(item.id)}
            className={styles.link}
            aria-current={current === item.id ? "true" : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
