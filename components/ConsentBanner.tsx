"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useConsent, withdrawConsent, writeConsent } from "@/lib/consent";
import styles from "./ConsentBanner.module.css";

// Asks before Google Analytics loads (decisions 218–219); hidden until hydration, since the choice lives in the
// browser. It stays usable over an open sheet (decision 228).
export function ConsentBanner({ gaId }: { gaId: string }) {
  const consent = useConsent();
  const shown = consent !== null && (consent.choice === null || consent.asking);
  const asking = consent?.asking ?? false;
  const ref = useRef<HTMLElement>(null);

  // Lets the sheet keep its last lines clear of the bar (decision 228).
  useEffect(() => {
    if (!shown) return;
    const bar = ref.current!;
    const root = document.documentElement;
    const measure = () =>
      root.style.setProperty("--consent-height", `${bar.offsetHeight}px`);
    measure();
    root.setAttribute("data-consent-open", "");
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      root.removeAttribute("data-consent-open");
      root.style.removeProperty("--consent-height");
    };
  }, [shown]);

  // Reopened from the footer: focus follows, so a keyboard visitor lands on the choice.
  useEffect(() => {
    if (shown && asking) ref.current?.focus();
  }, [shown, asking]);

  if (!shown) return null;

  function reject() {
    if (consent?.choice === "granted") withdrawConsent(gaId);
    else writeConsent("denied");
  }

  return (
    <section
      ref={ref}
      aria-label="Cookie consent"
      data-consent-banner=""
      tabIndex={-1}
      className={styles.banner}
    >
      <p className={styles.text}>
        This site uses Google Analytics cookies to see which pages are read,
        only if you accept. <Link href="/privacy">Privacy</Link>
      </p>
      {/* One class for both: rejecting is as easy as accepting (decision 219). */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.choice}
          onClick={() => writeConsent("granted")}
        >
          Accept
        </button>
        <button type="button" className={styles.choice} onClick={reject}>
          Reject
        </button>
      </div>
    </section>
  );
}
