"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { coverProgress } from "@/lib/slide";

// Runs only where the CSS scroll-driven slide is unsupported (Firefox stable), never alongside it (decision 86).
function useSlideFallback() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const track = ref.current;
    const heading = track?.parentElement;
    if (
      !track ||
      !heading ||
      typeof CSS?.supports !== "function" ||
      CSS.supports("animation-timeline: view()") ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    // Measures the heading, not the track: the track's own slide must not feed back into its progress.
    const apply = () => {
      frame = 0;
      if (reducedMotion.matches) {
        track.style.removeProperty("--slide-progress");
        return;
      }
      const box = heading.getBoundingClientRect();
      const progress = coverProgress(box.top, box.height, window.innerHeight);
      track.style.setProperty("--slide-progress", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);
  return ref;
}

export function SlideTrack({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const ref = useSlideFallback();
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
