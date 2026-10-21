"use client";

import { openConsentSettings } from "@/lib/consent";
import styles from "./Footer.module.css";

// Lets a visitor change their analytics choice at any time (decision 220).
export function CookieSettings() {
  return (
    <button
      type="button"
      className={styles.backToTop}
      onClick={openConsentSettings}
    >
      Cookie settings
    </button>
  );
}
