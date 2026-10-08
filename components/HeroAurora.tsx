"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./HeroAurora.module.css";

// Mouse devices only; touch gets the drift alone, and reduced motion gets neither (decision 81).
const POINTER_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function usePointerLean() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = ref.current;
    if (!hero || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(POINTER_QUERY);
    let frame = 0;
    let pointer = { x: 0, y: 0 };

    // -1…1 from the hero's centre; CSS turns it into a small offset and eases toward it.
    const apply = () => {
      frame = 0;
      const box = hero.getBoundingClientRect();
      const x = ((pointer.x - box.left) / box.width) * 2 - 1;
      const y = ((pointer.y - box.top) / box.height) * 2 - 1;
      hero.style.setProperty("--pointer-x", x.toFixed(3));
      hero.style.setProperty("--pointer-y", y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !query.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (query.matches) {
        hero.style.setProperty("--pointer-x", "0");
        hero.style.setProperty("--pointer-y", "0");
      } else {
        hero.style.removeProperty("--pointer-x");
        hero.style.removeProperty("--pointer-y");
      }
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", reset);
    query.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", reset);
      query.removeEventListener("change", reset);
    };
  }, []);
  return ref;
}

// Ambient aurora behind the Home hero (decisions 78–81); the drift is CSS, the pointer lean is the only script.
export function HeroAurora({ children }: { children: ReactNode }) {
  const ref = usePointerLean();
  return (
    <div ref={ref} className={styles.hero} data-hero-aurora-root>
      <div className={styles.aurora} aria-hidden="true" data-hero-aurora>
        <div className={styles.field}>
          <span className={`${styles.glow} ${styles.green}`} data-glow />
          <span className={`${styles.glow} ${styles.teal}`} data-glow />
          <span className={`${styles.glow} ${styles.violet}`} data-glow />
        </div>
      </div>
      {children}
    </div>
  );
}
