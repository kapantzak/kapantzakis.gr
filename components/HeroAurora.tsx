"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./HeroAurora.module.css";

// Mouse devices only; touch gets the sway alone, and reduced motion gets neither (decision 85).
const POINTER_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

function usePointerLean() {
  const rootRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    const aurora = auroraRef.current;
    if (!root || !aurora || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(POINTER_QUERY);
    let frame = 0;
    let pointer = { x: 0, y: 0 };

    const lean = (x: number, y: number) => {
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
    };
    // -1…1 from the aurora's centre. The aurora bleeds past the hero's column, so hit-test its box, not the hero's.
    const apply = () => {
      frame = 0;
      const box = aurora.getBoundingClientRect();
      const inside =
        pointer.x >= box.left &&
        pointer.x <= box.right &&
        pointer.y >= box.top &&
        pointer.y <= box.bottom;
      if (!inside) return lean(0, 0);
      lean(
        clamp(((pointer.x - box.left) / box.width) * 2 - 1),
        clamp(((pointer.y - box.top) / box.height) * 2 - 1),
      );
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !query.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (query.matches) lean(0, 0);
      else {
        root.style.removeProperty("--pointer-x");
        root.style.removeProperty("--pointer-y");
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    query.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      query.removeEventListener("change", reset);
    };
  }, []);
  return { rootRef, auroraRef };
}

// Ambient aurora behind the Home hero (decisions 78, 82–85); the sway is CSS, the pointer lean is the only script.
export function HeroAurora({ children }: { children: ReactNode }) {
  const { rootRef, auroraRef } = usePointerLean();
  return (
    <div ref={rootRef} className={styles.hero} data-hero-aurora-root>
      <div
        ref={auroraRef}
        className={styles.aurora}
        aria-hidden="true"
        data-hero-aurora
      >
        <span className={`${styles.band} ${styles.green}`} data-band />
        <span className={`${styles.band} ${styles.teal}`} data-band />
        <span className={`${styles.band} ${styles.violet}`} data-band />
        <span className={`${styles.band} ${styles.greenNear}`} data-band />
      </div>
      {children}
    </div>
  );
}
