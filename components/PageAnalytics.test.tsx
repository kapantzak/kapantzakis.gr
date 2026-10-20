import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetConsentStore, writeConsent } from "@/lib/consent";
import { PageAnalytics } from "./PageAnalytics";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => location.pathname,
}));

const SHEETS = ["/experience/netdata", "/education/msc-applied-informatics"];
const NETDATA = "/experience/netdata";
const MSC = "/education/msc-applied-informatics";

function analytics() {
  return <PageAnalytics gaId="G-TEST" sheetPaths={SHEETS} />;
}

/** Renders at `pathname`, then moves through `then`, as the URL would change. */
function visit(pathname: string, ...then: string[]) {
  location.pathname = pathname;
  const view = render(analytics());
  for (const next of then) move(view.rerender, next);
  return view;
}

function move(rerender: (ui: React.ReactNode) => void, pathname: string) {
  location.pathname = pathname;
  rerender(analytics());
}

/** The paths of the page views queued for gtag; its script never loads under jsdom. */
function pageviews() {
  return (window.dataLayer ?? [])
    .map((entry) => Array.from(entry as ArrayLike<unknown>))
    .filter(([command, name]) => command === "event" && name === "page_view")
    .map(
      ([, , params]) =>
        new URL((params as { page_location: string }).page_location).pathname,
    );
}

function tagScripts() {
  return document.head.querySelectorAll('script[src*="googletagmanager"]');
}

afterEach(() => {
  delete window.dataLayer;
  delete window.gtag;
  document.head.querySelectorAll("script").forEach((script) => script.remove());
  localStorage.clear();
  resetConsentStore();
});

describe("PageAnalytics with consent granted", () => {
  it("reports a sheet opened in the page, and not the return to / (decision 172)", () => {
    writeConsent("granted");
    visit("/", NETDATA, "/", NETDATA, "/");
    expect(pageviews()).toEqual(["/", NETDATA, NETDATA]);
  });

  it("counts / once after closing a sheet the page load opened (decision 172)", () => {
    writeConsent("granted");
    visit(MSC, "/", MSC, "/");
    expect(pageviews()).toEqual([MSC, "/", MSC]);
  });

  it("counts any other path, and / after it", () => {
    writeConsent("granted");
    visit("/blog/hello", "/");
    expect(pageviews()).toEqual(["/blog/hello", "/"]);
  });

  it("sends nothing for moves between / and the section paths (decision 180)", () => {
    writeConsent("granted");
    visit(
      "/",
      "/experience",
      "/education",
      "/",
      NETDATA,
      "/experience",
      "/writing",
    );
    expect(pageviews()).toEqual(["/", NETDATA]);
  });

  it("counts a section path a page load or the 404 page arrives on (decision 180)", () => {
    writeConsent("granted");
    visit("/nope", "/writing", "/contact");
    expect(pageviews()).toEqual(["/nope", "/writing"]);
  });

  it("counts the home page once after closing a sheet the page load opened, whichever path it shows (decision 180)", () => {
    writeConsent("granted");
    visit(MSC, "/", "/education", MSC, "/education");
    expect(pageviews()).toEqual([MSC, "/", MSC]);
  });

  it("sends one view on a load with consent granted", () => {
    writeConsent("granted");
    visit("/");
    expect(pageviews()).toEqual(["/"]);
    expect(tagScripts()).toHaveLength(1);
  });
});

describe("PageAnalytics and the visitor's choice", () => {
  it("loads and sends nothing before consent", () => {
    visit("/", NETDATA);
    expect(window.dataLayer).toBeUndefined();
    expect(tagScripts()).toHaveLength(0);
  });

  it("sends nothing after Reject", () => {
    writeConsent("denied");
    visit("/", NETDATA);
    expect(window.dataLayer).toBeUndefined();
  });

  it("counts the page in view on Accept and restarts the count (decision 224)", () => {
    const { rerender } = visit("/", NETDATA);
    act(() => writeConsent("granted"));
    expect(pageviews()).toEqual([NETDATA]);
    move(rerender, "/");
    expect(pageviews()).toEqual([NETDATA, "/"]);
  });
});
