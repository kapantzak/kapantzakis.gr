"use client";

import { usePathname } from "next/navigation";
import { scrollToTop } from "@/lib/scroll-top";
import styles from "./Footer.module.css";

// Home page only: the other pages do not scroll (decision 98).
export function BackToTop() {
  if (usePathname() !== "/") return null;
  return (
    <button type="button" className={styles.backToTop} onClick={scrollToTop}>
      Back to top
      <span className={styles.arrow} aria-hidden="true">
        ↑
      </span>
    </button>
  );
}
