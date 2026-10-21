import { useSyncExternalStore } from "react";
import { clearGaCookies, disableGtag } from "./gtag";

export type Consent = "granted" | "denied";

export type ConsentState = { choice: Consent | null; asking: boolean };

export const CONSENT_KEY = "consent";

const LIFETIME_MONTHS = 6;

// Kept in memory too, so a choice holds for the page's life when storage is blocked.
let remembered: Consent | null = null;
// Cookie settings reopened the banner (decision 220).
let asking = false;
const listeners = new Set<() => void>();
let snapshot: ConsentState | null = null;

function notify() {
  snapshot = null;
  for (const listener of listeners) listener();
}

function stored(now: number): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const { choice, at } = JSON.parse(raw) as {
      choice?: unknown;
      at?: unknown;
    };
    if ((choice !== "granted" && choice !== "denied") || typeof at !== "number")
      return null;
    // A choice is asked again after 6 calendar months (decision 223).
    const expires = new Date(at);
    expires.setMonth(expires.getMonth() + LIFETIME_MONTHS);
    return now < expires.getTime() ? choice : null;
  } catch {
    return null;
  }
}

export function readConsent(now = Date.now()): Consent | null {
  return remembered ?? stored(now);
}

export function writeConsent(choice: Consent, now = Date.now()): void {
  remembered = choice;
  asking = false;
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: now }));
  } catch {
    // Blocked storage: the choice lasts for this page only.
  }
  notify();
}

export function openConsentSettings(): void {
  asking = true;
  notify();
}

/** Reject after an Accept: the reload is what unloads the Google tag (decision 225). */
export function withdrawConsent(
  id: string,
  reload: () => void = () => window.location.reload(),
): void {
  writeConsent("denied");
  disableGtag(id);
  clearGaCookies(id);
  reload();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ConsentState {
  snapshot ??= { choice: readConsent(), asking };
  return snapshot;
}

// The choice lives in the browser, so the server and hydration render as unknown.
function getServerSnapshot(): null {
  return null;
}

/** The visitor's choice, or null before hydration. */
export function useConsent(): ConsentState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Forgets the in-memory state between tests. */
export function resetConsentStore(): void {
  remembered = null;
  asking = false;
  notify();
}
