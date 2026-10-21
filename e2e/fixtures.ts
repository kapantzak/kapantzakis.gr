import { test as base } from "@playwright/test";
import { CONSENT_KEY, type Consent } from "../lib/consent";

export { expect } from "@playwright/test";

/** Requests no test may send, even against production (section 32). */
export const GOOGLE =
  /^https:\/\/([^/]+\.)?(googletagmanager|google-analytics)\.com\//;

export const test = base.extend<{ consent: Consent | null }>({
  // A stored choice keeps the banner from covering what a spec clicks; null for the banner's own specs.
  consent: ["denied", { option: true }],
  page: async ({ page, consent }, provide) => {
    await page.route(GOOGLE, (route) => route.abort());
    if (consent) {
      // Only when absent, so a choice made during the test survives a reload.
      await page.addInitScript(
        ({ key, choice }) => {
          if (!localStorage.getItem(key)) {
            localStorage.setItem(
              key,
              JSON.stringify({ choice, at: Date.now() }),
            );
          }
        },
        { key: CONSENT_KEY, choice: consent },
      );
    }
    await provide(page);
  },
});
