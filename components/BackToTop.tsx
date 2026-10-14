"use client";

import { usePathname } from "next/navigation";
import { isHomePath } from "@/lib/nav";
import { scrollToTop } from "@/lib/scroll-top";
import styles from "./Footer.module.css";

// Home page only, on any of its paths: the other pages do not scroll (decisions 98, 183).
export function BackToTop() {
  if (!isHomePath(usePathname())) return null;
  return (
    <button type="button" className={styles.backToTop} onClick={scrollToTop}>
      Back to top
      <span className={styles.arrow} aria-hidden="true">
        ↑
      </span>
    </button>
  );
}
