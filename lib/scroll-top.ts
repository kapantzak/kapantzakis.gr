/** Element id of the logo-and-name link in the main nav; focus lands there after scrolling up (decision 97). */
export const BRAND_LINK_ID = "brand-link";

/** Scrolls the home page back to the top (decisions 94–97). */
export function scrollToTop(): void {
  // No `behavior`: the CSS `scroll-behavior` on <html> decides, so reduced motion jumps instead of gliding.
  window.scrollTo({ top: 0 });
  if (window.location.hash) {
    // Keep the router's state object so Next.js still recognises the entry.
    history.replaceState(
      history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }
  document.getElementById(BRAND_LINK_ID)?.focus({ preventScroll: true });
}
