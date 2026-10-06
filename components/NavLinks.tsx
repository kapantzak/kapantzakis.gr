"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, sectionHref, type SectionId } from "@/lib/nav";
import styles from "./Nav.module.css";

// A section counts as current while it crosses a band around the middle of the viewport.
const BAND = "-45% 0px -50% 0px";

function useSectionInView(enabled: boolean): SectionId | null {
  const [current, setCurrent] = useState<SectionId | null>(null);
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
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? current : null;
}

export function NavLinks() {
  const current = useSectionInView(usePathname() === "/");
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
