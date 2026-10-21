import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  openConsentSettings,
  readConsent,
  resetConsentStore,
  withdrawConsent,
  writeConsent,
} from "@/lib/consent";
import { ConsentBanner } from "./ConsentBanner";

vi.mock("@/lib/consent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/consent")>();
  return { ...actual, withdrawConsent: vi.fn() };
});

const banner = () => screen.queryByRole("region", { name: "Cookie consent" });

afterEach(() => {
  localStorage.clear();
  resetConsentStore();
  vi.clearAllMocks();
});

describe("ConsentBanner", () => {
  it("asks on a first visit, with equal Accept and Reject and a privacy link (decision 219)", () => {
    render(<ConsentBanner gaId="G-TEST" />);
    expect(banner()).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    const accept = screen.getByRole("button", { name: "Accept" });
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(accept.className).toBe(reject.className);
    expect(document.documentElement).toHaveAttribute("data-consent-open");
  });

  it("stores granted on Accept and hides", () => {
    render(<ConsentBanner gaId="G-TEST" />);
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(readConsent()).toBe("granted");
    expect(banner()).toBeNull();
    expect(document.documentElement).not.toHaveAttribute("data-consent-open");
  });

  it("stores denied on Reject and hides", () => {
    render(<ConsentBanner gaId="G-TEST" />);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(readConsent()).toBe("denied");
    expect(banner()).toBeNull();
    expect(withdrawConsent).not.toHaveBeenCalled();
  });

  it("stays hidden once a choice is made", () => {
    writeConsent("denied");
    render(<ConsentBanner gaId="G-TEST" />);
    expect(banner()).toBeNull();
  });

  it("returns, with focus, when Cookie settings reopens it (decision 220)", () => {
    writeConsent("denied");
    render(<ConsentBanner gaId="G-TEST" />);
    act(openConsentSettings);
    expect(banner()).toHaveFocus();
  });

  it("withdraws on Reject after an Accept (decision 225)", () => {
    writeConsent("granted");
    render(<ConsentBanner gaId="G-TEST" />);
    act(openConsentSettings);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(withdrawConsent).toHaveBeenCalledWith("G-TEST");
  });
});
