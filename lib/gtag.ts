declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const EXPIRED = "Thu, 01 Jan 1970 00:00:00 GMT";

/** The GA4 measurement ID; unset outside Vercel's Production environment (decision 222). */
export function gaId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_ID || undefined;
}

/** Loads the Google tag once; called only after the visitor accepts (decision 218). */
export function loadGtag(id: string): void {
  if (window.gtag) return;
  const dataLayer = (window.dataLayer ??= []);
  window.gtag = function gtag() {
    // gtag.js reads the Arguments object itself; a rest array is not processed.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  // Page views are sent by PageAnalytics, by the site's counting rules (decision 217).
  window.gtag("config", id, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
}

export function sendPageView(path: string): void {
  window.gtag?.("event", "page_view", {
    page_location: new URL(path + location.search, location.origin).href,
    page_title: document.title,
  });
}

/**
 * Stops a loaded tag before withdrawal's reload: an unload hit would otherwise set the GA cookies again (decision 225).
 * `ga-disable-<ID>` is Google's documented opt-out flag.
 */
export function disableGtag(id: string): void {
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
}

/** The hostname and each parent with at least two labels, where gtag's automatic cookie domain may have written. */
export function cookieDomains(hostname: string): string[] {
  const labels = hostname.split(".");
  const domains: string[] = [];
  for (let i = 0; i <= labels.length - 2; i++) {
    domains.push(labels.slice(i).join("."));
  }
  return domains;
}

/** Expires the GA cookies wherever gtag may have set them (decision 225). */
export function clearGaCookies(id: string): void {
  for (const name of ["_ga", `_ga_${id.replace(/^G-/, "")}`]) {
    document.cookie = `${name}=; path=/; expires=${EXPIRED}`;
    for (const domain of cookieDomains(location.hostname)) {
      document.cookie = `${name}=; path=/; domain=${domain}; expires=${EXPIRED}`;
    }
  }
}
